// app/api/organizations/api-key/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateApiKey } from "@/app/lib/apiKey";
import { withAuth } from "@/app/lib/withAuth";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";

export async function GET() {
  return withAuth([], async (session) => {
    await dbConnect();
    const org = await Organization.findById(session.organizationId);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!org.apiKey) {
      org.apiKey = generateApiKey(); // safety net for pre-existing orgs
      await org.save();
    }

    return NextResponse.json({
      apiKey: org.apiKey,
      allowedOrigins: org.allowedOrigins,
    });
  });
}

export async function POST() {
  return withAuth(["ADMIN", "PLATFORM_ADMIN"], async (session) => {
    await dbConnect();
    const org = await Organization.findById(session.organizationId);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    org.apiKey = generateApiKey();
    await org.save();

    return NextResponse.json({ apiKey: org.apiKey });
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(["ADMIN", "PLATFORM_ADMIN"], async (session) => {
    const { allowedOrigins } = await req.json();
    if (!Array.isArray(allowedOrigins)) {
      return NextResponse.json(
        { error: "allowedOrigins must be an array" },
        { status: 400 },
      );
    }

    await dbConnect();
    const org = await Organization.findByIdAndUpdate(
      session.organizationId,
      { allowedOrigins },
      { new: true },
    );

    return NextResponse.json({ allowedOrigins: org?.allowedOrigins ?? [] });
  });
}
