import { Prisma } from "@prisma/client/extension";

export const operations = ["similarity", "word_similarity", "strict_word_similarity"] as const;
export type Operation = (typeof operations)[number];
export const isOperation = (x: any): x is Operation => operations.includes(x);

export const comparators = ["gt", "gte", "eq", "lte", "lt"] as const;
export type Comparator = (typeof comparators)[number];
export const isComparator = (x: any): x is Comparator => comparators.includes(x);

export const orders = ["asc", "desc"] as const;
export type Order = (typeof orders)[number];
export const isOrder = (x: any): x is Order => orders.includes(x);

export type FieldQuery = {
  [operation in Operation]?: {
    text: string;
    threshold?: {
      [key in Comparator]?: number;
    };
    order?: Order;
  };
};

export type SimilarityQuery<T> = {
  [field in Prisma.Args<T, "findFirst">["distinct"]]?: FieldQuery;
} & { [field: string]: FieldQuery };

export type SimilarityArgs<T> = {
  query?: SimilarityQuery<T>;
  __meta?: { tableName: string };
};

export type SimilarityResult<T, A> = Array<
  Prisma.Result<T, A, "findFirst"> & { [key: `${string}_score`]: number } & { [key: string]: any }
>;
