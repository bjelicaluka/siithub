import { ObjectId } from "mongodb"
import { z } from "zod"
import { OBJECT_ID_REGEX } from "../patterns"

const emptyStringToUndefined = z.literal("").transform(() => undefined)

export function asOptionalField<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(emptyStringToUndefined)
}

export const optionalDateString = z.optional(z.string()
                            .regex(/((?:19|20)\d\d)-(0?[1-9]|1[012])-([12][0-9]|3[01]|0?[1-9])/, "Invalid date")
                            .transform(s => new Date(s))
                            .refine(d => d.getTime()===d.getTime(), "Invalid date")
);

export const objectIdString = (msg: string) => z.string().regex(OBJECT_ID_REGEX, msg).transform(s => new ObjectId(s));
