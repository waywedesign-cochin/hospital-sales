import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { deleteUser, updateUser } from "@/app/controllers/userController";

import { withAuth } from "@/app/middlewares/withAuth";

export const PUT = withAuth(["PLATFORM_ADMIN", "ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await updateUser(user.organizationId, id, user._id, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/users/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(["PLATFORM_ADMIN", "ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteUser(user.organizationId, id, user._id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/users/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
});
