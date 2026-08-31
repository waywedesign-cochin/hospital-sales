import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { verifyJwt } from "../lib/jwt";

export type AuthUser = { _id: string; role: string; organizationId: string };

export const withAuth =
  (allowedRoles: string[] = []) =>
  (handler: (req: NextRequest, user: AuthUser) => Promise<Response>) =>
  async (req: NextRequest) => {
    try {
      const token = (await cookies()).get("token")?.value;

      if (!token) return sendApiResponse(false, "Unauthorized");

      const user = verifyJwt<AuthUser>(token);
      if (!user) return sendApiResponse(false, "Invalid token");

      // Role based check
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return sendApiResponse(false, "Access denied");
      }

      // Ensure organizationId exists for non-platform-admin users
      if (user.role !== "PLATFORM_ADMIN" && !user.organizationId) {
        return sendApiResponse(false, "No organization associated with this account");
      }

      return handler(req, user);
    } catch (err: unknown) {
      return sendApiResponse(
        false,
        err instanceof Error ? err.message : "Auth error"
      );
    }
  };
