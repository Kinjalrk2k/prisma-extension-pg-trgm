import { SimilarityArgs } from "./types";

const POSSIBLE_TYPES = ["SIMILARITY", "WORD_SIMILARITY", "STRICT_WORD_SIMILARITY"];
const POSSIBLE_COMPARATORS = ["GT", "GTE", "EQ", "LTE", "LT"];
const POSSIBLE_ORDERING = ["ASC", "DESC"];

export default function validate<T>(args: SimilarityArgs<T>) {
  for (const arg of args) {
    const { type, order, threshold, thresholdCompare } = arg;

    if (!POSSIBLE_TYPES.includes(type.toUpperCase())) {
      throw new Error(`Invalid similarity operation. Valid operations: ${POSSIBLE_TYPES.join(", ")}`);
    }

    if (threshold) {
      // should be withing 0...1 range
      if (threshold < 0 && threshold > 1) {
        throw new Error(`Invalid threshold. SHould be within 0 and 1`);
      }
    }

    if (thresholdCompare) {
      if (!POSSIBLE_COMPARATORS.includes(thresholdCompare?.toUpperCase())) {
        throw new Error(`Invalid threshold comparison. Valid comparators: ${POSSIBLE_COMPARATORS.join(", ")}`);
      }
    }

    if (order) {
      if (!POSSIBLE_ORDERING.includes(order.toUpperCase())) {
        throw new Error(`Invalid odering. Valid ordering: ${POSSIBLE_ORDERING.join(", ")}`);
      }
    }
  }
}
