import { ExtensionArgs } from "../types";

async function install(prisma: any, extArgs: ExtensionArgs | undefined) {
  const query = "CREATE EXTENSION IF NOT EXISTS pg_trgm;";
  extArgs?.logQueries && console.log("[LOG](prisma-extension-pg-trgm.install)", query);
  await prisma.$queryRawUnsafe(query);
}

export default install;
