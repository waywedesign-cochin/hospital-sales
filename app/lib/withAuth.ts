import { NextResponse } from "next/server";
import { requireAuth } from "./auth";

export async function withAuth<T>(
  allowedRoles: string[] | string | undefined,
  handler: (session: {
    _id: string;
    role: string;
    organizationId: string;
  }) => Promise<T>,
) {
  try {
    const session = await requireAuth(allowedRoles);
    return await handler(session);
  } catch (err: any) {
    const status = err.message?.startsWith("Unauthorized") ? 401 : 403;
    return NextResponse.json({ error: err.message }, { status });
  }
}
