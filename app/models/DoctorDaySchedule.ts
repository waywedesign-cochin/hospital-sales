import mongoose, { Model, Schema } from "mongoose";

export interface IDoctorDaySchedule {
  _id: string;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  bookedIntervals: {
    start: number;
    end: number;
    appointmentId?: mongoose.Types.ObjectId;
  }[];
}

const doctorDayScheduleSchema = new Schema<IDoctorDaySchedule>(
  {
    doctorId: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    bookedIntervals: [
      {
        start: { type: Number, required: true },
        end: { type: Number, required: true },
        appointmentId: { type: mongoose.Types.ObjectId, ref: "Appointment" },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

doctorDayScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const DoctorDaySchedule: Model<IDoctorDaySchedule> =
  mongoose.models.DoctorDaySchedule ||
  mongoose.model<IDoctorDaySchedule>("DoctorDaySchedule", doctorDayScheduleSchema);

export default DoctorDaySchedule;
