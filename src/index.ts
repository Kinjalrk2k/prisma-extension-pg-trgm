import { Prisma, PrismaClient } from "@prisma/client";
import { SimilarityArgs, SimilarityResult } from "./types";
import similarity from "./similarity";
import install from "./install";

// TODO: Error handling
export const withPgTrgm = () => {
  return Prisma.defineExtension((prisma) => {
    (async () => await install(prisma))();

    return prisma.$extends({
      name: "prisma-extension-pg-trgm",
      client: {
        async $install() {
          return install(prisma);
        },
      },
      model: {
        $allModels: {
          async similarity<T, A>(this: T, args: SimilarityArgs<T>): Promise<SimilarityResult<T, A>> {
            const ctx = Prisma.getExtensionContext(this);
            return similarity<T, A>(ctx, prisma, args);
          },
        },
      },
    });
  });
};
