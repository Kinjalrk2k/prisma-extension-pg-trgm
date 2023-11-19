async function install(prisma: any) {
  await prisma.$queryRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
}

export default install;
