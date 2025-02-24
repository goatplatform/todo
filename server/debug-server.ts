import { startDebugServer } from "@goatdb/goatdb/server";
import { registerSchemas } from "../common/schema.ts";

async function main(): Promise<void> {
  registerSchemas();
  await startDebugServer({
    buildDir: "build",
    path: "server-data",
    jsPath: "client/index.tsx",
    htmlPath: "client/index.html",
    cssPath: "client/index.css",
    assetsPath: "client/assets",
    watchDir: ".",
    autoCreateUser: () => true,
    orgId: "todo",
  });
}

if (import.meta.main) main();
