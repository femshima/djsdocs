import { Collection } from '@discordjs/collection';
import type { EmbedField, APIEmbed } from 'discord.js';
import Fuse from 'fuse.js';

import {
  DocumentationTypeDefinition,
  DocumentationProperty,
  DocumentationClass,
  DocumentationClassEvent,
  DocumentationClassMethod,
  DocumentationClassProperty,
} from './types';

type ObjectTypes = 'Class' | 'Interface' | 'Typedef';

interface MemberType {
  /* eslint-disable @typescript-eslint/naming-convention */
  Name: DocumentationClass | DocumentationTypeDefinition;
  Event: DocumentationClassEvent;
  Method: DocumentationClassMethod;
  Prop: DocumentationClassProperty | DocumentationProperty;
  /* eslint-enable @typescript-eslint/naming-convention */
}

interface Entity<T extends keyof MemberType = keyof MemberType> {
  name: string;
  memberType: T;
  objectType: ObjectTypes;
  object: MemberType[T];
  package: string;
}

export default class EntityToEmbed {
  public constructor(private readonly dict: Collection<string, Entity>) {}

  public generateDetail(entity: Entity): APIEmbed {
    const extend =
      'extends' in entity.object &&
      entity.object.extends &&
      entity.object.extends
        .flat(2)
        .map((d: unknown) => this.getMarkdownLink(String(d)))
        .join(',');

    const fields: EmbedField[] = [];
    if ('props' in entity.object) {
      fields.push({
        name: 'Properties',
        inline: false,
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
        inline: false,
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
        inline: false,
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
        entity.object.description ?? ''
      }`,
      fields,
      footer:
        'meta' in entity.object && entity.object.meta.path
          ? {
              text: `[View Source](${this.repositoryURL(
                entity.package,
                entity.object.meta.path,
                entity.object.meta.file,
                entity.object.meta.line
              )})`,
            }
          : undefined,
    };
  }

  public generateSummary(res: Fuse.FuseResult<string>[]): APIEmbed {
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

  private docsURL(entity: Entity): string {
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
    line?: number | string
  ): string {
    const [_, status] = pkg.split('/');
    return `https://github.com/discordjs/discord.js/blob/${status}/${path}${
      file ? `/${file}` : ''
    }${line ? `#L${line}` : ''}`;
  }

  private getMarkdownLink(name: string): string {
    const item = this.dict.get(name);
    if (!item) return name;
    return `[${name}](${this.docsURL(item)})`;
  }

  private getObjectTypeEmoji(
    objType: ObjectTypes,
    memberType: keyof MemberType
  ): string {
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
