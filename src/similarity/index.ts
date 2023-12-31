import { ExtensionArgs } from "../types";
import {
  SimilarityQuery,
  SimilarityResult,
  isOperation,
  operations,
  isComparator,
  comparators,
  isOrder,
  orders,
  SimilarityArgs,
} from "./types";

async function similarity<T, A>(
  ctx: any,
  prisma: any,
  args: SimilarityArgs<T>,
  extArgs: ExtensionArgs | undefined
): Promise<SimilarityResult<T, A>> {
  try {
    const model = args?.__meta?.tableName || ctx.$name; // model name is the table name!

    extArgs?.logQueries && console.log("[LOG](prisma-extension-pg-trgm.model)", model);

    let selectList: string[] = [""]; // for handling comma. check the final query!
    let whereList: string[] = [];
    let orderList: string[] = [];

    if (args?.query) {
      Object.keys(args?.query).forEach((field: string) => {
        if (!args.query) {
          return; // Stupid TypeScript!
        }

        const fieldQuery = args.query[field];

        Object.keys(fieldQuery).forEach((operation: string) => {
          if (!isOperation(operation)) {
            throw new Error(`Invalid similarity operation. Valid operations: ${operations.join(", ")}`);
          }

          const operationQuery = fieldQuery[operation];

          /**
           * @example SIMILARITY(col_name, 'lorem')
           */
          const similarityOperation = `${operation}(${field}, '${operationQuery?.text}')`;

          /**
           * selectting fields with alias, field is same as column names
           * @example SIMILARITY(col_name, 'lorem') AS col_name_similarity_score
           */
          const q = `${similarityOperation} AS ${field}_${operation}_score`;
          selectList.push(q);

          if (operationQuery?.threshold) {
            Object.keys(operationQuery.threshold).forEach((comparator: string) => {
              if (!isComparator(comparator) || !operationQuery?.threshold) {
                throw new Error(`Invalid threshold comparison. Valid comparators: ${comparators.join(", ")}`);
              }

              const thresholdValue = operationQuery.threshold[comparator];
              if (!thresholdValue || thresholdValue < 0 || thresholdValue > 1) {
                throw new Error(`Invalid threshold. Should be within 0 and 1`);
              }

              // converting comparitions to actual comparator operators
              let compareOp = "";
              // prettier-ignore
              switch(comparator) {
                case 'gt': compareOp = ">"; break;
                case 'gte': compareOp = ">="; break;
                case 'lt': compareOp = "<"; break;
                case 'lte': compareOp = "<="; break;
                case 'eq': compareOp = "="; break;
                default:
                  throw new Error(`Invalid threshold comparison. Valid comparators: ${comparators.join(", ")}`);
              }

              /**
               * where queries based on similarity thresholds
               * @example SIMILARITY(col_name, 'lorem') > 0.25
               */
              const q = `${similarityOperation} ${compareOp} ${thresholdValue}`;
              whereList.push(q);
            });
          }

          if (operationQuery?.order) {
            if (!isOrder(operationQuery.order)) {
              throw new Error(`Invalid ordering. Valid ordering: ${orders.join(", ")}`);
            }

            /**
             * ordering based on the similarity scores
             * @example SIMILARITY(col_name, 'lorem') DESC
             */
            const q = `${similarityOperation} ${operationQuery.order}`;
            orderList.push(q);
          }
        });
      });
    }

    const selectQuery = selectList.join(", ");
    const whereQuery = whereList.length ? `WHERE ${whereList.join(" AND ")}` : "";
    const orderQuery = orderList.length ? `ORDER BY ${orderList.join(", ")}` : "";

    /**
     * @example SELECT * , similarity(col_name, 'lorem') AS col_name_similarity_score
     *          FROM "table_name"
     *          WHERE similarity(col_name, 'lorem') >= 0.01
     *          ORDER BY similarity(col_name, 'lorem') desc
     */
    const query = `SELECT * ${selectQuery} FROM "${model}" ${whereQuery} ${orderQuery}`;
    extArgs?.logQueries && console.log("[LOG](prisma-extension-pg-trgm.query)", query);

    const result = await prisma.$queryRawUnsafe(query);
    return result as SimilarityResult<T, A>;
  } catch (e) {
    throw e;
  }
}

export default similarity;
