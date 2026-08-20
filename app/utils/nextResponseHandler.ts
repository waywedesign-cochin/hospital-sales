import { NextResponse } from "next/server";

export const sendApiResponse = (
    success: boolean,
    message: string,
    data?: any
  ) => {
    return NextResponse.json(
      { success, message, data },
      { status: success ? 200 : 400 }
    );
  };