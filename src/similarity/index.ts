import { SimilarityArgs, SimilarityResult } from "./types";
import validate from "./validate";

async function similarity<T, A>(
  ctx: any,
  prisma: any,
  args: SimilarityArgs<T>
): Promise<SimilarityResult<T, A> | undefined> {
  try {
    /**
     * // BUG Wont work if the table or columns names are modified
     * // BUG https://www.prisma.io/docs/concepts/components/prisma-schema/names-in-underlying-database
     */
    const model = ctx.$name; // model name is the table name!

    validate<T>(args);

    let selectList = [""]; // for handling comma. check the final query!
    let whereList = [];
    let orderList = [];

    for (const arg of args) {
      /**
       * @example SIMILARITY(col_name, 'lorem')
       */
      const similarityOperation = `${arg.type}(${arg.field}, '${arg.text}')`;

      /**
       * field is same as column names
       * @example SIMILARITY(col_name, 'lorem') AS col_name_similarity_score
       */
      const q = `${similarityOperation} AS ${arg.field}_${arg.type.toLowerCase()}_score`;
      selectList.push(q);

      // converting comparitions to actual comparator operators
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

        /**
         * @example SIMILARITY(col_name, 'lorem') > 0.25
         */
        const q = `${similarityOperation} ${compareOp} ${arg.threshold}`;
        whereList.push(q);
      }

      if (arg.order) {
        /**
         * @example SIMILARITY(col_name, 'lorem') DESC
         */
        const q = `${similarityOperation} ${arg.order}`;
        orderList.push(q);
      }
    }

    const selectQuery = selectList.join(", ");
    const whereQuery = whereList.length ? `WHERE ${whereList.join(" AND ")}` : "";
    const orderQuery = orderList.length ? `ORDER BY ${orderList.join(", ")}` : "";

    const query = `SELECT * ${selectQuery} FROM "${model}" ${whereQuery} ${orderQuery}`;
    console.log(query);

    const result = await prisma.$queryRawUnsafe(query);
    return result as SimilarityResult<T, A>;
  } catch (e) {
    console.log({ e });
  }
}

export default similarity;
