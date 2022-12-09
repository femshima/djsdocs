import { Collection } from 'discord.js';
import {
  Documentation,
  DocumentationClass,
  DocumentationClassEvent,
  DocumentationClassMethod,
  DocumentationClassProperty,
} from '../../website/src/interfaces/Documentation';

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

export default class FromLegacyDocs {
  public dict: Collection<string, Entity>;
  constructor(src: string, docs: Documentation) {
    this.dict = new Collection(
      this.getEntities(docs).map((entity) => [
        entity.name,
        {
          ...entity,
          package: src,
        },
      ])
    );
  }

  public getNames(includePrivate: boolean): string[] {
    if (includePrivate) {
      return Array.from(this.dict.keys());
    } else {
      return Array.from(
        this.dict.filter((v) => v.object.access !== 'private').keys()
      );
    }
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
}
