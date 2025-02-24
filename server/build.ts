import { compile } from "@goatdb/goatdb/server";

async function main(): Promise<void> {
  await compile({
    buildDir: "build",
    serverEntry: "server/server.ts",
    jsPath: "client/index.tsx",
    htmlPath: "client/index.html",
    cssPath: "client/index.css",
    assetsPath: "client/assets",
    os: "linux",
    arch: "aar64",
    outputName: "todo",
  });
  Deno.exit();
}

if (import.meta.main) main();
