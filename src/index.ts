import { Prisma, PrismaClient } from "@prisma/client";
import { SimilarityArgs, SimilarityResult, SimilarityQueryArgs } from "./similarity/types";
import similarity from "./similarity";
import install from "./install";

export const withPgTrgm = () => {
  return Prisma.defineExtension((prisma) => {
    // install database extension
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
          async similarity<T, A>(this: T, args: SimilarityQueryArgs<T>): Promise<SimilarityResult<T, A> | undefined> {
            const ctx = Prisma.getExtensionContext(this);
            return similarity<T, A>(ctx, prisma, args);
          },
        },
      },
    });
  });
};
