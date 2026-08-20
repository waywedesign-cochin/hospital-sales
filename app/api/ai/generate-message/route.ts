import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dbConnect } from "@/app/lib/dbConnect";
import Patient from "@/app/models/Patient";

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone, audienceType, patientId } = await req.json();
    let context = "";

    if (audienceType === "specific" && patientId) {
      await dbConnect();
      const patient = await Patient.findById(patientId).lean();
      if (patient) {
        context = `The recipient is a patient named ${patient.firstName} ${patient.lastName}. Gender: ${patient.gender || "Unknown"}. Context: This is a hospital/clinic communication.`;
      }
    } else {
      context = "This message will be broadcasted to all patients of the clinic.";
    }

    const fullPrompt = `
      Act as a professional hospital/clinic communications assistant.
      Draft a WhatsApp message.
      Tone: ${tone}.
      Context: ${context}.
      Goal/Topic: ${prompt}.
      Constraints: Keep it concise, use appropriate emojis, and do not include any placeholder brackets like [Name] unless absolutely necessary (for broadcasts, use 'Dear Patient', for specific patients use their name). Do not include any quotation marks around the final message.
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: text
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
