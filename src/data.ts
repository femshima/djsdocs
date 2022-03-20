import { Documentation } from "../website/src/interfaces/Documentation";
import path from "path";
const cwd = process.cwd();
const data = {
  builders: require(path.join(cwd, "/data/builders/stable.json")),
  collection: require(path.join(cwd, "/data/collection/stable.json")),
  discordjs: require(path.join(cwd, "/data/discord.js/stable.json")),
  rest: require(path.join(cwd, "/data/rest/main.json")),
  voice: require(path.join(cwd, "/data/voice/stable.json")),
};

export default data as Record<keyof typeof data, Documentation>;
