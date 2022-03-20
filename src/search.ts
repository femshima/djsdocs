import Collection from "@discordjs/collection";
import Fuse from "fuse.js";
import { Documentation } from "../website/src/interfaces/Documentation";
import data from "./data";

function getNameObj<
  T extends "Name" | "Event" | "Method" | "Prop",
  U extends { name: string },
  V extends { name: string }
>(type: T, a: U, ...bc: T extends "Name" ? [] : [V]) {
  const b = bc[0];
  let name = "";
  switch (type) {
    case "Name":
      name = a.name;
      break;
    case "Event":
      if (!b) return undefined;
      name = `${a.name}#${b.name}`;
      break;
    case "Method":
      if (!b) return undefined;
      name = `${a.name}.${b.name}()`;
      break;
    case "Prop":
      if (!b) return undefined;
      name = `${a.name}.${b.name}`;
  }
  const obj = type === "Name" ? a : (b as T extends "Name" ? U : V);
  if (!obj) return undefined;
  return {
    name,
    obj,
  };
}

function getEntities(docs: Documentation) {
  return [
    docs.classes?.map((o) => [
      getNameObj("Name", o),
      o.events?.map((e) => getNameObj("Event", o, e)),
      o.methods?.map((m) => getNameObj("Method", o, m)),
      o.props?.map((p) => getNameObj("Prop", o, p)),
    ]),
    docs.typedefs?.map((o) => [
      getNameObj("Name", o),
      o.props?.map((p) => getNameObj("Prop", o, p)),
    ]),
    docs.interfaces?.map((o) => [
      getNameObj("Name", o),
      o.events?.map((e) => getNameObj("Event", o, e)),
      o.methods?.map((m) => getNameObj("Method", o, m)),
      o.props?.map((p) => getNameObj("Prop", o, p)),
    ]),
  ]
    .flat(3)
    .filter((v): v is Exclude<typeof v, undefined> => typeof v !== "undefined");
}

function getDict() {
  return new Collection(
    Object.values(data)
      .map((v) => getEntities(v))
      .flat(1)
      .map((d) => [d.name, d.obj])
  );
}

const dict = getDict();
const entities = Array.from(dict.keys());
console.log(dict.get("GuildMember"));

const fuse = new Fuse(entities);

function trim(str: string) {
  return str
    .replace(/^(.*)\s*([.#]\s*(.*)(\(\))?)?\s*$/g, "$1*$3")
    .toLowerCase();
}

export default function search(query: string) {
  const res = fuse.search(query);
  if (res[0]?.item && trim(res[0].item) == trim(query)) {
    const d = dict.get(res[0].item);
    return d;
  }
  return res;
}
