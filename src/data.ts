import { Documentation } from "../website/src/interfaces/Documentation";
import path from "path";
const cwd = process.cwd();
const data = {
  "builders/stable": require(path.join(cwd, "/data/builders/stable.json")),
  "collection/stable": require(path.join(cwd, "/data/collection/stable.json")),
  "discord.js/stable": require(path.join(cwd, "/data/discord.js/stable.json")),
  "rest/main": require(path.join(cwd, "/data/rest/main.json")),
  "voice/stable": require(path.join(cwd, "/data/voice/stable.json")),
};

export default data as Record<keyof typeof data, Documentation>;
