export type { paths, components } from "./schema";

export type Schema<T extends keyof SchemaMap> = SchemaMap[T];

type SchemaMap = import("./schema").components["schemas"];
