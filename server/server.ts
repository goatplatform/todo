import yargs from "yargs";
import * as path from "@std/path";
import { Server, staticAssetsFromJS } from "@goatdb/goatdb/server";
import { BuildInfo, prettyJSON } from "@goatdb/goatdb";
import { registerSchemas } from "../common/schema.ts";
// These imported files will be automatically generated during compilation
import encodedStaticAsses from "../build/staticAssets.json" with {
  type: "json",
};
import kBuildInfo from "../build/buildInfo.json" with { type: "json" };
import { SendRawEmailCommand, SES } from "@aws-sdk/client-ses";

interface Arguments {
  path?: string;
  version?: boolean;
  info?: boolean;
}

/**
 * This is the main server entry point. Edit it to include any custom setup
 * as needed.
 *
 * The build.ts script is responsible for compiling this entry point script
 * into a self contained executable.
 */
async function main(): Promise<void> {
  const buildInfo: BuildInfo = kBuildInfo as BuildInfo;
  const args: Arguments = yargs(Deno.args)
    .command(
      "<path>",
      "Start the server at the specified path",
    )
    .version(buildInfo.appVersion)
    .option("info", {
      alias: "i",
      desc: "Print technical information",
      type: "boolean",
    })
    .help()
    .parse();
  registerSchemas();
  if (args.info) {
    console.log(buildInfo.appName + " v" + buildInfo.appVersion);
    console.log(prettyJSON(buildInfo));
    Deno.exit();
  }

  const server = new Server({
    staticAssets: staticAssetsFromJS(encodedStaticAsses),
    path: args.path || path.join(Deno.cwd(), "todo-data"),
    buildInfo,
    // These functions enable custom mapping between domains and organizations
    // for multi-tenant applications. In this example we have a single
    // org/domain, but in a multi-tenant setup you could map different domains
    // to different organizations, e.g.
    // company1.example.com -> org1, company2.example.com -> org2
    // or
    // example.com/org1 -> org1, example.com/org2 -> org2
    domain: {
      resolveOrg: (_orgId: string) => "https://todo.goatdb.dev",
      resolveDomain: (_domain: string) => "todo",
    },
    autoCreateUser: () => true,
    port: 8001,
    // This application is deployed on a single EC2 instance, so we configure
    // AWS SES to handle email delivery through the underlying NodeMailer
    emailConfig: {
      SES: {
        ses: new SES({ region: "us-east-1" }),
        aws: { SendRawEmailCommand },
      },
      from: "system@ovvio.io",
    },
  });
  await server.start();
}

if (import.meta.main) main();
