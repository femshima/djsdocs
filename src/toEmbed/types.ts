type Type = ((string[] | null)[] | null)[] | null;

export interface DocumentationClassMeta {
  line: number;
  file: string;
  path?: string;
  url?: string;
}

export interface DocumentationProperty {
  name: string;
  description?: string;
  access?: string;
  type: string[][][];
}

export interface DocumentationClassProperty extends DocumentationProperty {
  props: DocumentationProperty[];
  meta: DocumentationClassMeta;
}

export interface DocumentationClassMethod {
  name: string;
  description?: string;
  access?: string;
  meta: DocumentationClassMeta;
}

export interface DocumentationClassEvent {
  description: string;
  meta: DocumentationClassMeta;
}

export interface DocumentationClass {
  description: string;
  extends: Type;
  props: DocumentationClassProperty[];
  methods: DocumentationClassMethod[];
  meta: DocumentationClassMeta;
}

export interface DocumentationTypeDefinition {
  description: string;
  props: DocumentationProperty[];
  type: string[][][];
  meta: DocumentationClassMeta;
}
