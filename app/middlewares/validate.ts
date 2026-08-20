import { NextRequest } from "next/server";
import { sendResponse } from "../utils/responseHandler";
import { ZodSchema, ZodError } from "zod";

export const validate = async <T>(
  schema: ZodSchema<T>,
  req: NextRequest
): Promise<[T | null, ReturnType<typeof sendResponse> | null]> => {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const zodError: ZodError = parsed.error;
      const errorMessage = zodError.issues
        .map(
          (issue) =>
            `${issue.path.length ? issue.path.join(".") : "body"} - ${
              issue.message
            }`
        )
        .join(", ");
      return [null, sendResponse(false, errorMessage)];
    }
    return [parsed.data, null];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return [null, sendResponse(false, message)];
  }
};
