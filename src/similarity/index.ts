import { SimilarityArgs, SimilarityResult } from "../types";
import { Prisma, PrismaClient } from "@prisma/client";

async function similarity<T, A>(ctx: any, prisma: any, args: SimilarityArgs<T>): Promise<SimilarityResult<T, A>> {
  const model = ctx.name;

  // TODO: validate

  let selectList = [""];
  let whereList = [];
  let orderList = [];
  for (const arg of args) {
    const q = `${arg.type}(${arg.field}, '${arg.text}') AS ${arg.field}_${arg.type}_score`;
    selectList.push(q);

    if (arg.threshold) {
      let compareOp = "";
      // prettier-ignore
      switch(arg.thresholdCompare) {
        case 'GT': compareOp = ">"; break;
        case 'GTE': compareOp = ">="; break;
        case 'LT': compareOp = "<"; break;
        case 'LTE': compareOp = "<="; break;
        case 'EQ': compareOp = "="; break;
      }

      const q = `${arg.type}(${arg.field}, '${arg.text}') ${compareOp} ${arg.threshold}`;
      whereList.push(q);
    }

    if (arg.order) {
      const q = `${arg.type}(${arg.field}, '${arg.text}') ${arg.order}`;
      orderList.push(q);
    }
  }

  const selectQuery = selectList.join(", ");
  const whereQuery = whereList.length ? `WHERE ${whereList.join(" AND ")}` : "";
  const orderQuery = whereList.length ? `ORDER BY ${orderList.join(", ")}` : "";

  const query = `SELECT * ${selectQuery} FROM "${model}" ${whereQuery} ${orderQuery}`;
  console.log(query);

  const result = await prisma.$queryRawUnsafe(query);
  return result as SimilarityResult<T, A>;
}

export default similarity;
