import { Prisma } from "@prisma/client/extension";

export type SimilarityArgs<T> = Array<{
  field: Prisma.Args<T, "findFirst">["distinct"];
  type: "SIMILARITY" | "WORD_SIMILARITY" | "STRICT_WORD_SIMILARITY";
  text: string;
  threshold?: number;
  thresholdCompare?: "GT" | "GTE" | "EQ" | "LTE" | "LT";
  order?: "ASC" | "DESC";
}>;

export type SimilarityResult<T, A> = Array<
  Prisma.Result<T, A, "findFirst"> & { [key: `${string}_score`]: number }
>;
