import { PrismaClient, Prisma } from "@prisma/client";
import { withPgTrgm } from "../dist";

const prisma = new PrismaClient().$extends(withPgTrgm());

async function main() {
  // const result = await prisma.post.similarity([
  //   { field: "title", text: "interpreter", type: "similarity", order: "DESC" },
  // {
  //   field: "title",
  //   text: "interpreter",
  //   type: "WORD_SIMILARITY",
  //   threshold: 0.01,
  //   thresholdCompare: "GT",
  // },
  // {
  //   field: "title",
  //   text: "interpreter",
  //   type: "STRICT_WORD_SIMILARITY",
  //   threshold: 0.002,
  //   thresholdCompare: "GT",
  // },
  // ]);

  const result = await prisma.post.similarity({
    title: {
      similarity: { text: "interpreter", order: "desc" },
      // word_similarity: { text: "interpreter", threshold: { gt: 0.01 } },
      // strict_word_similarity: { text: "interpreter", threshold: { gt: 0.002 } },
    },
    content: {
      // similarity: { text: "IP", threshold: { gte: 0.01 } },
    },
  });

  console.log(result);
}

main();
