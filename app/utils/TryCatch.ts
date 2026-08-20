import { sendResponse, ActionResponse } from "../utils/responseHandler";

export const TryCatch =
  <T extends (...args: any[]) => Promise<ActionResponse | any>>(handler: T) =>
  async (...args: Parameters<T>): Promise<ActionResponse> => {
    try {
      // The handler must return the success structure (e.g., { success: true, ... })
      return await handler(...args);
    } catch (error: any) {
      return sendResponse(false, error?.message || "Internal Server Error");
    }
  };
