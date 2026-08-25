import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";

export async function requireAuth(allowedRoles?: string[] | string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const decoded = verifyJwt<{ _id: string; role: string; clinicId: string }>(token);

  if (!decoded) {
    throw new Error("Unauthorized: Invalid or expired token");
  }

  // Normalize allowedRoles to array
  const requiredRolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRoles
    ? [allowedRoles]
    : [];

  // Check role only if required
  if (
    requiredRolesArray.length > 0 &&
    !requiredRolesArray.includes(decoded.role)
  ) {
    throw new Error("Forbidden: You do not have permission");
  }

  return decoded; 
}
