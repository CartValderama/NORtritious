import { useEffect, useState } from "react";
import {
  fetchCalculatorSchema,
  EMPTY_SCHEMA,
  type CalculatorSchema,
} from "../../services/calculatorService";

// Keeps the form's schema in step with the picked category and food type. Everything the
// form used to derive from local copies of the rules (which fields to show, which claims
// will be assessed, the thresholds it highlights against) comes from here instead.
//
// EMPTY_SCHEMA while a fetch is in flight, so the form renders no inputs rather than a set
// derived from stale rules. A failed fetch leaves it empty too: showing nothing is honest,
// where guessing a field set is how a claim ends up judged on a number nobody entered.
export function useCalculatorSchema(category: string, foodType: string): CalculatorSchema {
  const [schema, setSchema] = useState<CalculatorSchema>(EMPTY_SCHEMA);

  useEffect(() => {
    if (!category || !foodType) {
      setSchema(EMPTY_SCHEMA);
      return undefined;
    }
    let cancelled = false;
    setSchema(EMPTY_SCHEMA);
    fetchCalculatorSchema(category, foodType)
      .then((s) => {
        if (!cancelled) setSchema(s);
      })
      .catch(() => {
        if (!cancelled) setSchema(EMPTY_SCHEMA);
      });
    return () => {
      cancelled = true;
    };
  }, [category, foodType]);

  return schema;
}
