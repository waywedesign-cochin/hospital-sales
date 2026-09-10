import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import Doctor from "@/app/models/Doctor";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { resolveDoctorScope, RequestingUser } from "@/app/utils/DoctorScope";
import { isPresenceFresh } from "@/lib/presence";

// Heartbeat: called periodically by any open dashboard tab.
async function postHandler(_req: NextRequest, user: AuthUser) {
  await dbConnect();

  await User.updateOne(
    { _id: user._id },
    { $set: { lastSeenAt: new Date(), isOnline: true } },
  );

  return NextResponse.json({ success: true });
}

// Presence for the doctors this user is allowed to see.
async function getHandler(_req: NextRequest, user: AuthUser) {
  await dbConnect();

  if (!user.organizationId) {
    return NextResponse.json(
      { success: false, message: "Organization ID is missing" },
      { status: 400 },
    );
  }

  const requestingUser: RequestingUser = {
    _id: user._id,
    role: user.role as RequestingUser["role"],
  };
  if (user.role === "STAFF") {
    const userDoc = await User.findById(user._id).select("assignedDoctors");
    requestingUser.assignedDoctors =
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
  }

  const doctorScope = await resolveDoctorScope(user.organizationId, requestingUser);
  if (doctorScope && doctorScope.length === 0) {
    return NextResponse.json({ success: true, data: { presence: [] } });
  }

  const doctorFilter: any = {
    organizationId: new mongoose.Types.ObjectId(user.organizationId),
  };
  if (doctorScope) {
    doctorFilter._id = {
      $in: doctorScope.map((id) => new mongoose.Types.ObjectId(id.toString())),
    };
  }

  const doctors = await Doctor.find(doctorFilter)
    .select("_id userId status")
    .lean();

  const userIds = doctors
    .map((d) => d.userId?.toString())
    .filter((id): id is string => !!id);
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id lastSeenAt isOnline lastLoginAt")
    .lean();

  const usersById = new Map(users.map((u) => [u._id.toString(), u]));

  const presence = doctors.map((doctor) => {
    const account = doctor.userId
      ? usersById.get(doctor.userId.toString())
      : undefined;
    const lastSeenAt = account?.lastSeenAt ?? null;

    return {
      doctorId: doctor._id.toString(),
      status: doctor.status,
      hasLoginAccount: !!doctor.userId,
      hasEverLoggedIn: !!account?.lastLoginAt,
      lastActiveAt: lastSeenAt ?? account?.lastLoginAt ?? null,
      isOnline: isPresenceFresh(account?.isOnline, lastSeenAt),
    };
  });

  return NextResponse.json({ success: true, data: { presence } });
}

const ROLES = ["ADMIN", "DOCTOR", "STAFF", "NURSE"];

export const POST = withAuth(ROLES)(postHandler as any);
export const GET = withAuth(ROLES)(getHandler as any);
