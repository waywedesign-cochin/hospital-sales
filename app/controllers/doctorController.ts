import Doctor from "../models/Doctor";
import User from "../models/User";
import { sendApiResponse } from "../utils/nextResponseHandler";
import bcrypt from "bcrypt";
import { sendResponse } from "../utils/responseHandler";
import DoctorLeave from "../models/DoctorLeave";
//add doctor
export const addDoctor = async (data: {
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

  const doctorExists = await Doctor.findOne({ email });
  if (doctorExists) {
    return sendApiResponse(false, "Doctor already exists");
  }
  const newDoctor = await Doctor.create({
    ...data,
    email: email.toLowerCase(),
  });
  if (!newDoctor) {
    return sendApiResponse(false, "Something went wrong");
  }
  if (password && email) {
    const lowercasedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: lowercasedEmail });
    if (userExists) {
      return sendApiResponse(false, "User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      email: lowercasedEmail,
      password: hashedPassword,
      role: "DOCTOR",
    });
  }
  return sendApiResponse(true, "Doctor created successfully", newDoctor);
};

//get all doctors
export const getAllDoctors = async (
  page: number,
  limit: number,
  search?: string,
  specialization?: string
) => {
  try {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
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
export const getDoctorById = async (id: string) => {
  if (!id) {
    return sendResponse(false, "Invalid request", null);
  }
  const doctorExists = await Doctor.findById(id);
  if (!doctorExists) {
    return sendResponse(false, "Doctor not found", null);
  }

  const doctor = await Doctor.findById(id).lean();
  console.log(doctor);

  return sendResponse(true, "Doctor fetched successfully", {
    ...doctor,
    _id: doctor?._id.toString(),
  });
};

//update doctor
export const updateDoctor = async (
  id: string,
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
  const doctorExists = await Doctor.findById(id);
  if (!doctorExists) {
    return sendApiResponse(false, "Doctor not found");
  }

  const doctor = await Doctor.findByIdAndUpdate({ _id: id }, data, {
    new: true,
  });
  return sendApiResponse(true, "Doctor updated successfully", doctor);
};

//delete doctor
export const deleteDoctor = async (id: string) => {
  const doctorExists = await Doctor.findById(id);
  if (!doctorExists) {
    return sendApiResponse(false, "Doctor not found");
  }
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) {
    return sendApiResponse(false, "Failed to delete doctor");
  }
  await User.findOneAndDelete({ email: doctor.email.toLowerCase() });

  return sendApiResponse(true, "Doctor deleted successfully");
};


