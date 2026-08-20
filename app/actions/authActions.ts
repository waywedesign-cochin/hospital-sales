"use server";

import { logout, signIn, signUp } from "../controllers/authController";
import { dbConnect } from "../lib/dbConnect";
import { sendResponse } from "../utils/responseHandler";
import { signInSchema, signUpSchema } from "../validations/authSchemas";

// ================= SIGN IN ACTION =================
export const signInAction = async (data: {
  email: string;
  password: string;
}) => {
  try {
    await dbConnect();

    const parsed = signInSchema.safeParse(data);

    if (!parsed.success) {
      return sendResponse(false, parsed.error.issues[0].message);
    }

    return await signIn(parsed.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return sendResponse(false, error.message);
    }

    return sendResponse(false, "Internal server error");
  }
};

// ================= SIGN UP ACTION =================
export const signUpAction = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}) => {
  try {
    await dbConnect();

    const parsed = signUpSchema.safeParse(data);

    if (!parsed.success) {
      return sendResponse(false, parsed.error.issues[0].message);
    }

   
    const formattedData = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      password: parsed.data.password,
    };

    return await signUp(formattedData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return sendResponse(false, error.message);
    }

    return sendResponse(false, "Internal server error");
  }
};

//logout action
export const logoutAction = async () => {
    try {
      return await logout();
    } catch {
      return sendResponse(false, "Internal server error");
    }
  };