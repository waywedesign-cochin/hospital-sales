import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import { createEnquiry } from "@/app/controllers/enquiryController";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  treatmentCategory: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
});

function corsHeaders(origin: string | null, allowed: string[]) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (allowed.length === 0) headers["Access-Control-Allow-Origin"] = "*";
  else if (origin && allowed.includes(origin))
    headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin"), []),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ apiKey: string }> },
) {
  await dbConnect();
  const { apiKey } = await params;
  const origin = req.headers.get("origin");

  const org = await Organization.findOne({ apiKey, isActive: true });
  if (!org)
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const headers = corsHeaders(origin, org.allowedOrigins);

  if (
    org.allowedOrigins.length > 0 &&
    origin &&
    !org.allowedOrigins.includes(origin)
  ) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403, headers },
    );
  }

  if (rateLimited(String(org._id))) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400, headers },
    );
  }

  // Reuses the same patient-matching + enquiry-creation logic as every other lead source
  const result = await createEnquiry({
    organizationId: String(org._id),
    ...parsed.data,
    source: "WEBSITE",
    // no userId passed — logActivity is skipped for anonymous website submissions, which is correct
  });

  return NextResponse.json(result, { status: 201, headers });
}
