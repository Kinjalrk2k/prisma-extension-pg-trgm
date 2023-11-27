import { PrismaClient, Prisma } from "@prisma/client";
import { withPgTrgm } from "../dist";

const prisma = new PrismaClient().$extends(withPgTrgm({ logQueries: true }));

async function main() {
  const result = await prisma.post.similarity({
    title: {
      similarity: { text: "interpreter", order: "desc" },
      word_similarity: { text: "interpreter", threshold: { gt: 0.01 } },
      strict_word_similarity: { text: "interpreter", threshold: { gt: 0.002, lte: 0.3 } },
    },
  });

  console.log(result);
}

main();
