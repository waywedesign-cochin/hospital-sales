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

export const success = <D = undefined>(
  data?: D,
  message: string = "Success"
): ActionResponse<D> => {
  return { success: true, message, data };
};

export const error = (
  message: string,
  status?: number
): ActionResponse<any> => {
  return { success: false, message, data: undefined };
};