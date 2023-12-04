import { Prisma } from "@prisma/client/extension";
import { SimilarityResult, SimilarityQuery, SimilarityArgs } from "./similarity/types";
import similarity from "./similarity";
import install from "./install";
import { ExtensionArgs } from "./types";

export const withPgTrgm = (extArgs?: ExtensionArgs) => {
  return Prisma.defineExtension((prisma) => {
    // install database extension
    (async () => await install(prisma, extArgs))();

    return prisma.$extends({
      name: "prisma-extension-pg-trgm",
      client: {
        async $install() {
          return install(prisma, extArgs);
        },
      },
      model: {
        $allModels: {
          /**
           * Calculate similarity of texts using the pg_trgm extension of PostgreSQL
           * along with additional filtering and ordering.
           *
           * @see https://www.postgresql.org/docs/current/pgtrgm.html
           *
           * Similarity queries include:
           * - similarity
           * - word_similarity
           * - strict_word_similarity
           *
           * Comparators for filtering include:
           * - gt = Greater than
           * - gte = Greater than or equals to
           * - lt = Lesser than
           * - lte = Lesser than or equals to
           * - eq = Equals to
           *
           * Orderings include:
           * - asc - Ascending Order
           * - desc - Descending Order
           *
           * @example
           * // Basic Example
           * const result = await prisma.post.similarity({
           *   query: {
           *     title: {
           *       similarity: { text: "interpreter", order: "desc" },
           *       word_similarity: { text: "interpreter", threshold: { gt: 0.01 } },
           *       strict_word_similarity: { text: "interpreter", threshold: { gt: 0.002, lte: 0.3 } },
           *     },
           *   },
           * });
           *
           *
           * @example
           * // Where models or fields have been renamed
           * const result = await prisma.tags.similarity({
           *   query: {
           *     // the field in Prisma model is tagName, still in database it's tag_name
           *     tag_name: {
           *       similarity: { text: "or", threshold: { gte: 0.01 }, order: "desc" },
           *     },
           *   },
           *   __meta: {
           *     tableName: "label", // here the actual table name is passed
           *   },
           * });
           *
           * @param this
           * @param args Arguments for similarity query
           * @returns
           */
          async similarity<T, A>(this: T, args: SimilarityArgs<T>): Promise<SimilarityResult<T, A>> {
            const ctx = Prisma.getExtensionContext(this);
            return similarity<T, A>(ctx, prisma, args, extArgs);
          },
        },
      },
    });
  });
};
