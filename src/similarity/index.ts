import {
  SimilarityArgs,
  SimilarityQueryArgs,
  SimilarityResult,
  FieldQuery,
  isOperation,
  operations,
  isComparator,
  comparators,
  isOrder,
  orders,
} from "./types";
import validate from "./validate";

async function similarity<T, A>(
  ctx: any,
  prisma: any,
  args: SimilarityQueryArgs<T>
): Promise<SimilarityResult<T, A> | undefined> {
  try {
    /**
     * // BUG Wont work if the table or columns names are modified
     * // BUG https://www.prisma.io/docs/concepts/components/prisma-schema/names-in-underlying-database
     */
    const model = ctx.$name; // model name is the table name!

    console.log(args);
    console.log(model);

    let selectList: string[] = [""]; // for handling comma. check the final query!
    let whereList: string[] = [];
    let orderList: string[] = [];
    Object.keys(args).forEach((field: string) => {
      const fieldQuery = args[field];

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
         * field is same as column names
         * @example SIMILARITY(col_name, 'lorem') AS col_name_similarity_score
         */
        const q = `${similarityOperation} AS ${field}_${operation}_score`;
        selectList.push(q);

        if (operationQuery?.threshold) {
          // converting comparators to actual comparator operators

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
            }

            /**
             * @example SIMILARITY(col_name, 'lorem') > 0.25
             */
            const q = `${similarityOperation} ${compareOp} ${thresholdValue}`;
            whereList.push(q);
          });
        }

        if (operationQuery?.order) {
          if (!isOrder(operationQuery.order)) {
            throw new Error(`Invalid odering. Valid ordering: ${orders.join(", ")}`);
          }

          console.log(operationQuery?.order);

          /**
           * @example SIMILARITY(col_name, 'lorem') DESC
           */
          const q = `${similarityOperation} ${operationQuery.order}`;
          orderList.push(q);
        }
      });
    });

    const selectQuery = selectList.join(", ");
    const whereQuery = whereList.length ? `WHERE ${whereList.join(" AND ")}` : "";
    const orderQuery = orderList.length ? `ORDER BY ${orderList.join(", ")}` : "";

    const query = `SELECT * ${selectQuery} FROM "${model}" ${whereQuery} ${orderQuery}`;
    console.log(query);

    const result = await prisma.$queryRawUnsafe(query);
    return result as SimilarityResult<T, A>;

    // validate<T>(args);

    // let selectList = [""]; // for handling comma. check the final query!
    // let whereList = [];
    // let orderList = [];

    // for (const arg of args) {
    //   /**
    //    * @example SIMILARITY(col_name, 'lorem')
    //    */
    //   const similarityOperation = `${arg.type}(${arg.field}, '${arg.text}')`;

    //   /**
    //    * field is same as column names
    //    * @example SIMILARITY(col_name, 'lorem') AS col_name_similarity_score
    //    */
    //   const q = `${similarityOperation} AS ${arg.field}_${arg.type.toLowerCase()}_score`;
    //   selectList.push(q);

    //   // converting comparitions to actual comparator operators
    //   if (arg.threshold) {
    //     let compareOp = "";
    //     // prettier-ignore
    //     switch(arg.thresholdCompare) {
    //     case 'GT': compareOp = ">"; break;
    //     case 'GTE': compareOp = ">="; break;
    //     case 'LT': compareOp = "<"; break;
    //     case 'LTE': compareOp = "<="; break;
    //     case 'EQ': compareOp = "="; break;
    //   }

    //     /**
    //      * @example SIMILARITY(col_name, 'lorem') > 0.25
    //      */
    //     const q = `${similarityOperation} ${compareOp} ${arg.threshold}`;
    //     whereList.push(q);
    //   }

    //   if (arg.order) {
    //     /**
    //      * @example SIMILARITY(col_name, 'lorem') DESC
    //      */
    //     const q = `${similarityOperation} ${arg.order}`;
    //     orderList.push(q);
    //   }
    // }

    // const selectQuery = selectList.join(", ");
    // const whereQuery = whereList.length ? `WHERE ${whereList.join(" AND ")}` : "";
    // const orderQuery = orderList.length ? `ORDER BY ${orderList.join(", ")}` : "";

    // const query = `SELECT * ${selectQuery} FROM "${model}" ${whereQuery} ${orderQuery}`;
    // console.log(query);

    // const result = await prisma.$queryRawUnsafe(query);
    // return result as SimilarityResult<T, A>;

    // return {} as SimilarityResult<T, A>;
  } catch (e) {
    console.log({ e });
  }
}

export default similarity;
