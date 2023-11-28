import { PrismaClient } from "@prisma/client";
import { withPgTrgm } from "prisma-extension-pg-trgm";

const prisma = new PrismaClient().$extends(withPgTrgm({ logQueries: true }));

async function main() {
  const result = await prisma.post.similarity({
    query: {
      title: {
        similarity: { text: "interpreter", order: "desc" },
        word_similarity: { text: "interpreter", threshold: { gt: 0.01 } },
        strict_word_similarity: { text: "interpreter", threshold: { gt: 0.002, lte: 0.3 } },
      },
    },
  });
  console.log(result);

  const result2 = await prisma.tags.similarity({
    query: { tag_name: { similarity: { text: "or", threshold: { gte: 0.01 }, order: "desc" } } },
    __meta: { tableName: "label" },
  });
  console.log(result2);
}

main();
