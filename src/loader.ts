import { Documentation } from '../website/src/interfaces/Documentation';
import fs from 'fs/promises';
import fs_sync from 'fs';
import path from 'path';

const cwd = process.cwd();

export async function load(src: string): Promise<Documentation> {
  const match =
    /^(?<package>[A-Za-z0-9.]+)\/(?<version>[A-Za-z]+|[0-9.]+)$/.exec(src);
  if (!match?.groups) throw new Error('Invalid src name');

  const content = await fs.readFile(
    path.join(
      cwd,
      'data',
      match.groups.package,
      `${match.groups.version}.json`
    ),
    { encoding: 'utf-8' }
  );
  return JSON.parse(content) as Documentation;
}

//Synchronous functions. Only for testing.

export function loadSync(src: string): Documentation {
  const match =
    /^(?<package>[A-Za-z0-9.]+)\/(?<version>[A-Za-z]+|[0-9.]+)$/.exec(src);
  if (!match?.groups) throw new Error('Invalid src name');

  const content = fs_sync.readFileSync(
    path.join(
      cwd,
      'data',
      match.groups.package,
      `${match.groups.version}.json`
    ),
    { encoding: 'utf-8' }
  );
  return JSON.parse(content) as Documentation;
}
