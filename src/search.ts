import Collection from '@discordjs/collection';
import { EmbedFieldData, MessageEmbedOptions } from 'discord.js';
import Fuse from 'fuse.js';
import { Documentation } from '../website/src/interfaces/Documentation';
import data from './data';

function getNameObj<
  T extends 'Name' | 'Event' | 'Method' | 'Prop',
  K extends 'Class' | 'Typedef' | 'Interface',
  U extends { name: string },
  V extends { name: string }
>(type: T, objType: K, a: U, ...bc: T extends 'Name' ? [] : [V]) {
  const b = bc[0];
  let name = '';
  switch (type) {
    case 'Name':
      name = a.name;
      break;
    case 'Event':
      if (!b) return undefined;
      name = `${a.name}#${b.name}`;
      break;
    case 'Method':
      if (!b) return undefined;
      name = `${a.name}.${b.name}()`;
      break;
    case 'Prop':
      if (!b) return undefined;
      name = `${a.name}.${b.name}`;
  }
  const obj = type === 'Name' ? a : b;
  if (!obj) return undefined;
  return {
    name,
    objType,
    memberType: type,
    obj: obj as T extends 'Name' ? U : V,
  };
}

function getEntities(docs: Documentation) {
  return [
    docs.classes?.map((o) => [
      getNameObj('Name', 'Class', o),
      o.events?.map((e) => getNameObj('Event', 'Class', o, e)),
      o.methods?.map((m) => getNameObj('Method', 'Class', o, m)),
      o.props?.map((p) => getNameObj('Prop', 'Class', o, p)),
    ]),
    docs.typedefs?.map((o) => [
      getNameObj('Name', 'Typedef', o),
      o.props?.map((p) => getNameObj('Prop', 'Typedef', o, p)),
    ]),
    docs.interfaces?.map((o) => [
      getNameObj('Name', 'Interface', o),
      o.events?.map((e) => getNameObj('Event', 'Interface', o, e)),
      o.methods?.map((m) => getNameObj('Method', 'Interface', o, m)),
      o.props?.map((p) => getNameObj('Prop', 'Interface', o, p)),
    ]),
  ]
    .flat(3)
    .filter((v): v is Exclude<typeof v, undefined> => typeof v !== 'undefined');
}

function getDict() {
  return new Collection(
    Object.keys(data)
      .map((k) =>
        getEntities(data[k as keyof typeof data]).map((c) => ({
          ...c,
          package: k,
        }))
      )
      .flat(1)
      .map((d) => [d.name, { ...d }])
  );
}

const dict = getDict();
const entities = Array.from(dict.keys());

const fuse = new Fuse(entities);

function trim(str: string) {
  return str
    .replace(/^(.*?)\s*([.#]\s*(.*?)(\(\))?)?\s*$/g, '$1*$3')
    .toLowerCase();
}

function nameToURL(pkg: string, name: string) {
  const base = `https://discord.js.org/#/docs/${pkg}/class/`;
  return (
    base +
    name
      .replace('#', '?scrollTo=e-')
      .replace('.', '?scrollTo=')
      .replace('()', '')
  );
}

function metaToURL(
  pkg: string,
  path: string,
  file?: string,
  line?: string | number
) {
  const [pkgName, _] = pkg.split('/');
  return (
    'https://github.com/discordjs/discord.js/blob/main/packages/' +
    `${pkgName}/${path}${file ? `/${file}` : ''}${line ? `#L${line}` : ''}`
  );
}

function getLinkTextToObject(name: string) {
  const item = dict.get(name);
  if (!item) return name;
  return `[${name}](${nameToURL(item.package, name)})`;
}

function getObjTypeEmoji(
  objType: 'Class' | 'Typedef' | 'Interface',
  memberType: 'Name' | 'Event' | 'Method' | 'Prop'
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

export default function search(query: string): MessageEmbedOptions {
  const res = fuse.search(query);
  if (
    res[0]?.item &&
    trim(res[0].item) === trim(query) &&
    dict.has(res[0].item)
  ) {
    // The above dict.has guarantees this.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = dict.get(res[0].item)!;
    const d = item.obj;

    const extend =
      'extends' in d &&
      d.extends
        .flat(2)
        .map((d) => getLinkTextToObject(d))
        .join(',');

    const fields: EmbedFieldData[] = [];
    if ('props' in d) {
      fields.push({
        name: 'Properties',
        value: d.props
          .filter((prop) => prop.access !== 'private')
          .map((prop) => `\`${prop.name}\` `)
          .join(''),
      });
    }
    if ('methods' in d) {
      fields.push({
        name: 'Methods',
        value: d.methods
          .filter((method) => method.access !== 'private')
          .map((method) => `\`${method.name}\` `)
          .join(''),
      });
    }
    if ('type' in d) {
      fields.push({
        name: 'Type',
        value: d.type
          .flat(3)
          .map((type) => {
            if (type === '<' || type === '>' || type === ', ') return type;
            return getLinkTextToObject(type);
          })
          .join(''),
      });
    }

    return {
      title: `__${res[0].item}__`,
      url: nameToURL(item.package, res[0].item),
      description: `${extend ? `*extends ${extend}*` : ''}\n${d.description}`,
      fields,
      footer: {
        text:
          'meta' in d
            ? `[View Source](${metaToURL(
                item.package,
                d.meta.path,
                d.meta.file,
                d.meta.line
              )})`
            : undefined,
      },
    };
  } else {
    return {
      title: 'Search Results:',
      description: res
        .slice(0, 10)
        .map((r) => {
          const name = r.item;
          const item = dict.get(name);
          if (!item) return name;
          return (
            getObjTypeEmoji(item.objType, item.memberType) +
            getLinkTextToObject(name)
          );
        })
        .join('\n'),
    };
  }
}
