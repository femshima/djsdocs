import type { APIEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import { Documentation } from '../website/src/interfaces/Documentation';
import FromLegacyDocs from './fromDocs/legacy';
import EntityToEmbed from './toEmbed';

export default class DocumentationSearch {
  private readonly from: FromLegacyDocs;
  private readonly to: EntityToEmbed;
  private readonly fuse: Fuse<string>;
  public constructor(
    src: string,
    docs: Documentation,
    includePrivate: boolean
  ) {
    this.from = new FromLegacyDocs(src, docs);
    this.to = new EntityToEmbed(this.from.dict);

    this.fuse = new Fuse(this.from.getNames(includePrivate));
  }

  public search(query: string): APIEmbed {
    const res = this.fuse.search(query);
    const firstResult: string | undefined = res[0]?.item;
    const firstEntity = firstResult && this.from.dict.get(firstResult);
    if (firstEntity && this.trim(firstResult) === this.trim(query)) {
      return this.to.generateDetail(firstEntity);
    } else {
      return this.to.generateSummary(res);
    }
  }

  private trim(str: string): string {
    return str
      .replace(/^(.*?)\s*([.#]\s*(.*?)(\(\))?)?\s*$/g, '$1*$3')
      .toLowerCase();
  }
}
