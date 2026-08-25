import mongoose, { Schema, Model } from "mongoose";

export interface IEnquiryActivity {
  clinicId: mongoose.Types.ObjectId;
  enquiryId: mongoose.Types.ObjectId;
  type: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";
  note: string;
  createdBy?: mongoose.Types.ObjectId;
  date?: Date;
  createdAt?: Date;
}

const enquiryActivitySchema = new Schema<IEnquiryActivity>(
  {
    clinicId: {
      type: mongoose.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    enquiryId: {
      type: mongoose.Types.ObjectId,
      ref: "Enquiry",
      required: true,
    },

    type: {
      type: String,
      enum: ["NEW", "CONTACTED", "FOLLOW_UP", "APPOINTMENT_BOOKED"],
    },

    note: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const EnquiryActivity: Model<IEnquiryActivity> =
  mongoose.models.EnquiryActivity ||
  mongoose.model<IEnquiryActivity>("EnquiryActivity", enquiryActivitySchema);

export default EnquiryActivity;
