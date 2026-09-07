import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointment from "../app/models/Appointment";
import DoctorDaySchedule from "../app/models/DoctorDaySchedule";
import { timeStringToMinutes } from "../lib/timeUtils";

dotenv.config({ path: ".env.local" });

async function migrate() {
  if (!process.env.MONGODB_URL) {
    console.error("Missing MONGODB_URL");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB.");

  // Fetch all appointments
  // Using lean() might not let us save directly, but we can do find()
  const appointments = await Appointment.find();

  let migratedCount = 0;

  for (const appt of appointments) {
    // If startTime is already a number, skip
    if (typeof appt.startTime === "number") {
      continue;
    }

    const startStr = String(appt.startTime); // e.g. "10:20"
    const startMinutes = timeStringToMinutes(startStr);
    
    // Default legacy duration is 20
    const durationMinutes = 20; 
    const endMinutes = startMinutes + durationMinutes;

    // Update appointment using updateOne to bypass schema validation errors on legacy missing fields
    await Appointment.updateOne(
      { _id: appt._id },
      { 
        $set: { 
          startTime: startMinutes,
          endTime: endMinutes,
          durationMinutes: durationMinutes
        }
      }
    );
    
    console.log(`Migrated Appointment ${appt._id} -> start: ${startMinutes}, end: ${endMinutes}`);

    // Update DoctorDaySchedule
    if (appt.doctor && appt.date) {
      const doctorId = (appt.doctor as any)._id || appt.doctor;
      
      await DoctorDaySchedule.updateOne(
        { doctorId: doctorId, date: appt.date },
        { $setOnInsert: { bookedIntervals: [] } },
        { upsert: true }
      );

      // Atomic push (idempotent if already pushed? We just push)
      await DoctorDaySchedule.updateOne(
        { doctorId: doctorId, date: appt.date },
        { 
          $push: { 
            bookedIntervals: { 
              start: startMinutes, 
              end: endMinutes,
              appointmentId: appt._id
            } 
          } 
        }
      );
    }

    migratedCount++;
  }

  console.log(`Migration complete. Migrated ${migratedCount} appointments.`);
  mongoose.disconnect();
}

migrate().catch(console.error);
