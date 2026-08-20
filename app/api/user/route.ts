import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { deleteUser, updateUser } from "@/app/controllers/userController";

export async function PUT(req: NextRequest) {
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

    const result = await updateUser(id, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/users/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export const DELETE = async (req: NextRequest) => {
  try {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteUser(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/users/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
