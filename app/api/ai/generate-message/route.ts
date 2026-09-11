import { NextRequest, NextResponse } from "next/server";
import {
  GenerativeModel,
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { dbConnect } from "@/app/lib/dbConnect";
import Patient from "@/app/models/Patient";
import Organization from "@/app/models/Organization";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";

// Gemini intermittently answers 503 ("high demand") or 429 on a request that
// succeeds moments later, so those get a couple of short retries.
const TRANSIENT_STATUSES = new Set([429, 500, 503]);
const RETRY_DELAYS_MS = [1000, 2000];

const isTransientGeminiError = (error: unknown) =>
  error instanceof GoogleGenerativeAIFetchError &&
  TRANSIENT_STATUSES.has(error.status ?? 0);

async function generateWithRetry(model: GenerativeModel, prompt: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (!isTransientGeminiError(error) || attempt >= RETRY_DELAYS_MS.length) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
}

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    const { prompt, tone, audienceType, patientId } = await req.json();
    let context = "";

    await dbConnect();
    
    // Get organization name for sign-off
    let hospitalName = "The Clinic/Hospital";
    if (user.organizationId) {
      const org = await Organization.findById(user.organizationId).lean();
      if (org) {
        hospitalName = org.name;
      }
    }

    if (audienceType === "specific" && patientId) {
      const patient = await Patient.findById(patientId).lean();
      if (patient) {
        context = `The recipient is a patient named ${patient.firstName} ${patient.lastName}. Gender: ${patient.gender || "Unknown"}. Context: This is a communication from ${hospitalName}.`;
      }
    } else if (audienceType === "birthday") {
      context = `This is a birthday wish that will be sent today to every patient of ${hospitalName} who has a birthday today. It goes out to multiple different patients at once, so it must NOT name any specific patient.`;
    } else {
      context = `This message will be broadcasted to all patients of ${hospitalName}.`;
    }

    const nameConstraint =
      audienceType === "birthday"
        ? "This is a generic birthday wish sent to many patients at once — do NOT include a name or placeholder for one at all (not even 'Dear Patient'); greet them generically, e.g. 'Happy Birthday!'."
        : "do not include any placeholder brackets like [Name] unless absolutely necessary (for broadcasts, use 'Dear Patient', for specific patients use their name)";

    const fullPrompt = `
      Act as a professional hospital/clinic communications assistant.
      Draft a WhatsApp message.
      Tone: ${tone}.
      Context: ${context}.
      Goal/Topic: ${prompt}.
      Constraints: Keep it concise, use appropriate emojis, and ${nameConstraint}. Do not include any quotation marks around the final message.
      IMPORTANT: For the sign-off at the end of the message, ALWAYS use the name "${hospitalName}". Do NOT use generic terms like "Your Healthcare Team" or "The Medical Staff".
    `;

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response if API key is not set
      return NextResponse.json({
        success: true,
        message: `(Mock AI Response - Set GEMINI_API_KEY in .env to enable real AI)\n\nHi ${audienceType === 'specific' ? 'there' : 'Patient'},\n\nThis is a mocked message based on your prompt: "${prompt}".\n\nTone applied: ${tone}.`
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const result = await generateWithRetry(model, fullPrompt);
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: text
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    if (isTransientGeminiError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini is busy right now. Please try again in a moment.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["ADMIN", "DOCTOR", "STAFF"])(postHandler as any);
