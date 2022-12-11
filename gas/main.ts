import DocumentationSearch from '../src';

interface ApiEventGet {
  queryString: string;
  parameter: Record<string, string>;
  parameters: Record<string, string[]>;
  contentLength: number;
}

let Properties = PropertiesService.getScriptProperties();
let fileId = Properties.getProperty('fileId');
if (!fileId) throw new Error('fileId is undefined');
let folder = DriveApp.getFolderById(fileId);

export function doGet(e: ApiEventGet): unknown {
  let { query, includePrivate, src } = e.parameter;
  query ??= '';
  src ??= 'discord.js/stable';

  try {
    const json = processRequest(query, includePrivate === 'true', src);

    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (e) {
    return ContentService.createTextOutput(String(e));
  }
}

function processRequest(query: string, includePrivate: boolean, src: string) {
  const match =
    /^(?<package>[A-Za-z0-9.]+)\/(?<version>[A-Za-z]+|[0-9.]+)$/.exec(src);
  if (!match?.groups) throw new Error('Invalid src name');

  const packageFolder = folder.getFoldersByName(match.groups.package).next();
  const dataFile = packageFolder
    .getFilesByName(`${match.groups.version}.json`)
    .next();
  const data = dataFile.getBlob().getDataAsString('utf8');

  const search = new DocumentationSearch(src, JSON.parse(data), includePrivate);

  return search.search(query);
}
