import Collection from '@discordjs/collection';
import { EmbedFieldData, MessageEmbedOptions } from 'discord.js';
import Fuse from 'fuse.js';
import {
  Documentation,
  DocumentationClass,
  DocumentationClassEvent,
  DocumentationClassMethod,
  DocumentationClassProperty,
} from '../website/src/interfaces/Documentation';

type ExtractFromArray<T> = T extends Array<infer R> ? R : never;

type DocumentationTypeDefinition = ExtractFromArray<Documentation['typedefs']>;
type DocumentationTypeDefinitionProperty = ExtractFromArray<
  DocumentationTypeDefinition['props']
>;

type ObjectTypes = 'Class' | 'Typedef' | 'Interface';

interface MemberType {
  Name: DocumentationClass | DocumentationTypeDefinition;
  Event: DocumentationClassEvent;
  Method: DocumentationClassMethod;
  Prop: DocumentationClassProperty | DocumentationTypeDefinitionProperty;
}

interface Entity<T extends keyof MemberType = keyof MemberType> {
  name: string;
  memberType: T;
  objectType: ObjectTypes;
  object: MemberType[T];
  package: string;
}

export default class DocumentationSearch {
  private dict: Collection<string, Entity>;
  private fuse: Fuse<string>;
  constructor(docs: Record<string, Documentation>) {
    this.dict = this.getDict(docs);
    const names = Array.from(this.dict.keys());

    this.fuse = new Fuse(names);
  }

  private getDict(
    data: Record<string, Documentation>
  ): Collection<string, Entity> {
    return new Collection(
      Object.entries(data)
        .map(([k, v]) =>
          this.getEntities(v).map((entity) => ({
            ...entity,
            package: k,
          }))
        )
        .flat()
        .map((d) => [d.name, d])
    );
  }

  private getEntities(docs: Documentation): Omit<Entity, 'package'>[] {
    return [
      docs.classes?.map((o) => [
        this.getEntity('Name', 'Class', o, o),
        o.events?.map((e) => this.getEntity('Event', 'Class', o, e)),
        o.methods?.map((m) => this.getEntity('Method', 'Class', o, m)),
        o.props?.map((p) => this.getEntity('Prop', 'Class', o, p)),
      ]),
      docs.typedefs?.map((o) => [
        this.getEntity('Name', 'Typedef', o, o),
        o.props?.map((p) => this.getEntity('Prop', 'Typedef', o, p)),
      ]),
      docs.interfaces?.map((o) => [
        this.getEntity('Name', 'Interface', o, o),
        o.events?.map((e) => this.getEntity('Event', 'Interface', o, e)),
        o.methods?.map((m) => this.getEntity('Method', 'Interface', o, m)),
        o.props?.map((p) => this.getEntity('Prop', 'Interface', o, p)),
      ]),
    ]
      .flat(3)
      .filter(
        (v): v is Exclude<typeof v, undefined> => typeof v !== 'undefined'
      );
  }

  private getEntity<T extends keyof MemberType>(
    type: T,
    objectType: ObjectTypes,
    a: MemberType['Name'],
    b: MemberType[T]
  ): Omit<Entity<T>, 'package'> | undefined {
    let name = '';
    switch (type) {
      case 'Name':
        name = a.name;
        break;
      case 'Event':
        name = `${a.name}#${b.name}`;
        break;
      case 'Method':
        name = `${a.name}.${b.name}()`;
        break;
      case 'Prop':
        name = `${a.name}.${b.name}`;
    }
    return {
      name,
      objectType,
      memberType: type,
      object: b,
    };
  }

  search(query: string): MessageEmbedOptions {
    const res = this.fuse.search(query);
    const firstResult: string | undefined = res[0]?.item;
    const firstEntity = firstResult && this.dict.get(firstResult);
    if (firstEntity && this.trim(firstResult) === this.trim(query)) {
      return this.generateDetail(firstEntity);
    } else {
      return this.generateSummary(res);
    }
  }

  private generateDetail(entity: Entity): MessageEmbedOptions {
    const extend =
      'extends' in entity.object &&
      entity.object.extends
        .flat(2)
        .map((d) => this.getMarkdownLink(d))
        .join(',');

    const fields: EmbedFieldData[] = [];
    if ('props' in entity.object) {
      fields.push({
        name: 'Properties',
        value: entity.object.props
          .filter((prop) => prop.access !== 'private')
          .map((prop) => `\`${prop.name}\``)
          .sort()
          .join(' '),
      });
    }
    if ('methods' in entity.object) {
      fields.push({
        name: 'Methods',
        value: entity.object.methods
          .filter((method) => method.access !== 'private')
          .map((method) => `\`${method.name}\``)
          .sort()
          .join(' '),
      });
    }
    if ('type' in entity.object) {
      fields.push({
        name: 'Type',
        value: entity.object.type
          .flat(3)
          .map((type) => {
            if (/[<> ,]/.test(type)) return type;
            return this.getMarkdownLink(type);
          })
          .reduce<[number, string[]]>(
            (prev, type) => {
              const [level, str] = prev;
              const newLevel = Math.max(
                level +
                  (/</.exec(type)?.length ?? 0) -
                  (/>/.exec(type)?.length ?? 0),
                0
              );

              if (level === 0 && !/[<> ,]/.test(type)) {
                return [newLevel, [...str, type]];
              } else {
                const nstr = [...str];
                nstr[nstr.length - 1] += type;
                return [newLevel, nstr];
              }
            },
            [0, []]
          )[1]
          .map((s) => `\`${s}\``)
          .join(' '),
      });
    }

    return {
      title: `__${entity.name}__`,
      url: this.docsURL(entity),
      description: `${extend ? `*extends ${extend}*` : ''}\n${
        entity.object.description
      }`,
      fields,
      footer: {
        text:
          'meta' in entity.object
            ? `[View Source](${this.repositoryURL(
                entity.package,
                entity.object.meta.path,
                entity.object.meta.file,
                entity.object.meta.line
              )})`
            : undefined,
      },
    };
  }

  private generateSummary(res: Fuse.FuseResult<string>[]): MessageEmbedOptions {
    return {
      title: 'Search Results:',
      description: res
        .slice(0, 10)
        .map((r) => {
          const name = r.item;
          const item = this.dict.get(name);
          if (!item) return name;
          return (
            this.getObjectTypeEmoji(item.objectType, item.memberType) +
            this.getMarkdownLink(name)
          );
        })
        .join('\n'),
    };
  }

  private trim(str: string) {
    return str
      .replace(/^(.*?)\s*([.#]\s*(.*?)(\(\))?)?\s*$/g, '$1*$3')
      .toLowerCase();
  }

  private docsURL(entity: Entity) {
    const search = entity.name
      .replace('#', '?scrollTo=e-')
      .replace('.', '?scrollTo=')
      .replace('()', '');
    return `https://discord.js.org/#/docs/${
      entity.package
    }/${entity.objectType.toLowerCase()}/${search}`;
  }

  private repositoryURL(
    pkg: string,
    path: string,
    file?: string,
    line?: string | number
  ) {
    const [_, status] = pkg.split('/');
    return `https://github.com/discordjs/discord.js/blob/${status}/${path}${
      file ? `/${file}` : ''
    }${line ? `#L${line}` : ''}`;
  }

  private getMarkdownLink(name: string) {
    const item = this.dict.get(name);
    if (!item) return name;
    return `[${name}](${this.docsURL(item)})`;
  }

  private getObjectTypeEmoji(
    objType: ObjectTypes,
    memberType: keyof MemberType
  ) {
    switch (memberType) {
      case 'Name':
        switch (objType) {
          case 'Class':
            return ':regional_indicator_c:';
          case 'Typedef':
            return ':regional_indicator_t:';
          case 'Interface':
            return ':regional_indicator_i:';
        }
        break;
      case 'Event':
        return ':regional_indicator_e:';
      case 'Method':
        return ':regional_indicator_m:';
      case 'Prop':
        return ':regional_indicator_p:';
    }
  }
}
