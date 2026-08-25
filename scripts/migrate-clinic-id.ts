import mongoose from "mongoose";
import dotenv from "dotenv";

// Load models
import "../app/models/Clinic";
import "../app/models/User";
import "../app/models/Doctor";
import "../app/models/Patient";
import "../app/models/Enquiry";
import "../app/models/EnquiryActivity";
import "../app/models/Appointment";
import "../app/models/DoctorLeave";
import "../app/models/ActivityLog";
import "../app/models/MessageLog";
import "../app/models/TreatmentCategory";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // 1. Create a Default Clinic
    const Clinic = mongoose.model("Clinic");
    let defaultClinic = await Clinic.findOne({ name: "Default Clinic" });
    
    if (!defaultClinic) {
      defaultClinic = await Clinic.create({
        name: "Default Clinic",
        subdomain: "default",
        contactEmail: "admin@default.com",
        contactPhone: "0000000000",
        address: "Default Address",
        status: "ACTIVE",
      });
      console.log("Created Default Clinic:", defaultClinic._id);
    } else {
      console.log("Default Clinic already exists:", defaultClinic._id);
    }

    const clinicId = defaultClinic._id;

    // 2. Update all existing documents
    const modelsToUpdate = [
      "User",
      "Doctor",
      "Patient",
      "Enquiry",
      "EnquiryActivity",
      "Appointment",
      "DoctorLeave",
      "ActivityLog",
      "MessageLog",
      "TreatmentCategory",
    ];

    for (const modelName of modelsToUpdate) {
      try {
        const Model = mongoose.model(modelName);
        const result = await Model.updateMany(
          { clinicId: { $exists: false } },
          { $set: { clinicId } }
        );
        console.log(`Updated ${result.modifiedCount} records in ${modelName}`);
      } catch (error) {
        console.error(`Failed to update ${modelName}:`, error);
      }
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateData();
