export interface ActionResponse<D = undefined> {
  success: boolean;
  message: string;
  data?: D;
}

export const sendResponse = <D = undefined>(
  success: boolean,
  message: string,
  data?: D
): ActionResponse<D> => {
  return { success, message, data };
};