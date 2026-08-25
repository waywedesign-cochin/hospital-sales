import mongoose, { Model, Schema } from "mongoose";

export interface ITreatmentCategory {
  _id: string;
  clinicId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const treatmentCategorySchema = new Schema<ITreatmentCategory>(
  {
    clinicId: {
      type: mongoose.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const TreatmentCategory: Model<ITreatmentCategory> =
  mongoose.models.TreatmentCategory ||
  mongoose.model<ITreatmentCategory>(
    "TreatmentCategory",
    treatmentCategorySchema
  );

export default TreatmentCategory;