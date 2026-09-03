import Doctor from "../models/Doctor";
import User from "../models/User";
import { sendApiResponse } from "../utils/nextResponseHandler";
import bcrypt from "bcrypt";
import { sendResponse } from "../utils/responseHandler";
import DoctorLeave from "../models/DoctorLeave";
import { logActivity } from "./activityLogController";

//add doctor
export const addDoctor = async (data: {
  organizationId: string;
  userId?: string;
  prefix: string;
  firstName: string;
  lastName?: string;
  email: string;
  contactNumber: string;
  address: string;
  qualification: string;
  specialization: string[];
  education: string;
  experience: string;
  registrationNumber: string;
  avatar?: string;
  password: string;
}) => {
  const {
    prefix,
    firstName,
    lastName,
    email,
    contactNumber,
    address,
    qualification,
    specialization,
    education,
    experience,
    registrationNumber,
    avatar,
    password,
  } = data;

  const doctorExists = await Doctor.findOne({ email, organizationId: data.organizationId });
  if (doctorExists) {
    return sendApiResponse(false, "Doctor already exists in this clinic");
  }

  // Check if User email is already taken before creating the Doctor profile
  if (password && email) {
    const lowercasedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: lowercasedEmail, organizationId: data.organizationId });
    if (userExists) {
      return sendApiResponse(false, "User email is already taken in this clinic");
    }
  }

  const newDoctor = await Doctor.create({
    ...data,
    email: email.toLowerCase(),
  });
  
  if (!newDoctor) {
    return sendApiResponse(false, "Something went wrong creating the doctor");
  }

  if (password && email) {
    const lowercasedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      organizationId: data.organizationId,
      firstName,
      lastName,
      email: lowercasedEmail,
      password: hashedPassword,
      role: "DOCTOR",
    });
  }

  if (data.userId) {
    await logActivity(
      data.organizationId,
      data.userId,
      "ADDED_DOCTOR",
      "Doctor",
      `Added a new doctor: ${firstName} ${lastName || ""}`.trim(),
      newDoctor._id
    );
  }

  return sendApiResponse(true, "Doctor created successfully", newDoctor);
};

//get all doctors
export const getAllDoctors = async (
  organizationId: string,
  page: number,
  limit: number,
  search?: string,
  specialization?: string
) => {
  try {
    const skip = (page - 1) * limit;

    const whereClause: any = { organizationId };
    if (search) {
      whereClause.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { qualification: { $regex: search, $options: "i" } },
      ];
    }
    if (specialization) {
      whereClause.specialization = { $regex: specialization, $options: "i" };
    }
    const totalCount = await Doctor.countDocuments(whereClause);
    const doctors = await Doctor.find(whereClause)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const doctorsList = doctors.map((doctor) => ({
      _id: doctor._id.toString(),
      prefix: doctor.prefix,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      contactNumber: doctor.contactNumber,
      address: doctor.address,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      education: doctor.education,
      experience: doctor.experience,
      registrationNumber: doctor.registrationNumber,
      // avatar: doctor.avatar,
      status: doctor.status,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));
    return sendResponse(true, "Doctors fetched successfully", {
      doctors: doctorsList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.log(err);
    return sendResponse(false, "Something went wrong");
  }
};

//get doctor by id
export const getDoctorById = async (organizationId: string, id: string) => {
  if (!id) {
    return sendResponse(false, "Invalid request", null);
  }
  const doctorExists = await Doctor.findOne({ _id: id, organizationId });
  if (!doctorExists) {
    return sendResponse(false, "Doctor not found", null);
  }

  const doctor = await Doctor.findOne({ _id: id, organizationId }).lean();
  console.log(doctor);

  return sendResponse(true, "Doctor fetched successfully", {
    ...doctor,
    _id: doctor?._id.toString(),
  });
};

//update doctor
export const updateDoctor = async (
  organizationId: string,
  id: string,
  userId: string,
  data: {
    prefix: string;
    firstName: string;
    lastName?: string;
    email: string;
    contactNumber: string;
    address: string;
    qualification: string;
    specialization: string[];
    education: string;
    experience: string;
    registrationNumber: string;
    status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
    //avatar?: string;
  }
) => {
  const doctorExists = await Doctor.findOne({ _id: id, organizationId });
  if (!doctorExists) {
    return sendApiResponse(false, "Doctor not found");
  }

  const doctor = await Doctor.findByIdAndUpdate({ _id: id }, data, {
    new: true,
  });

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "UPDATED_DOCTOR",
      "Doctor",
      `Updated doctor profile for ${doctor?.firstName} ${doctor?.lastName || ""}`.trim(),
      id
    );
  }

  return sendApiResponse(true, "Doctor updated successfully", doctor);
};

//delete doctor
export const deleteDoctor = async (organizationId: string, id: string, userId: string) => {
  const doctorExists = await Doctor.findOne({ _id: id, organizationId });
  if (!doctorExists) {
    return sendApiResponse(false, "Doctor not found");
  }
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) {
    return sendApiResponse(false, "Failed to delete doctor");
  }
  await User.findOneAndDelete({ email: doctor.email.toLowerCase(), organizationId });

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "DELETED_DOCTOR",
      "Doctor",
      `Deleted doctor profile for ${doctor.firstName} ${doctor.lastName || ""}`.trim(),
      id
    );
  }

  return sendApiResponse(true, "Doctor deleted successfully");
};


