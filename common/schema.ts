import { itemPathGetPart, SchemaManager } from "@goatdb/goatdb";

export const kSchemaTask = {
  ns: "task",
  version: 1,
  fields: {
    text: {
      type: "string",
      default: () => "",
    },
    done: {
      type: "boolean",
      default: () => false,
    },
    dateCreated: {
      type: "date",
      default: () => new Date(),
    },
  },
} as const;
export type SchemaTypeTask = typeof kSchemaTask;

// ====== Add new schemas here ====== //

/**
 * This is the main registration function for all schemas in this project.
 * It gets called from both the client and the server code so they agree on the
 * same schemas.
 *
 * @param manager The schema manager to register with.
 *                Uses {@link SchemaManager.default} if not provided.
 */
export function registerSchemas(
  manager: SchemaManager = SchemaManager.default,
): void {
  manager.registerSchema(kSchemaTask);
  // Allow each user to write to its own repository and block everyone else
  manager.registerAuthRule(
    /\/data\/\w+/,
    (_db, repoPath, _itemKey, session, _op) =>
      itemPathGetPart(repoPath, "repo") === session.owner,
  );
}
