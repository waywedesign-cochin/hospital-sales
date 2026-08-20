import DoctorLeave from "../models/DoctorLeave";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";

//manage leave
export const createLeave = async (data: {
  doctor: string;
  fromDate: string;
  toDate: string;
  type: string;
  slots: string[];
  startTime: string;
  endTime: string;
  reason: string;
}) => {
  const leave = await DoctorLeave.create(data);
  return sendApiResponse(true, "Leave added successfully", leave);
};

//get leaves
export const getLeaves = async (
  id?: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  doctor?: string,
  month?: string,
  year?: string,
  type?: string
) => {
  const Doctor = (await import("@/app/models/Doctor")).default;
  const skip = (page - 1) * limit;

  // FETCH SINGLE LEAVE
  if (id) {
    const leave = await DoctorLeave.findById(id).populate("doctor").lean();
    if (!leave) return sendResponse(false, "Leave not found", null);

    const responseData = {
      _id: leave._id.toString(),
      doctor: leave.doctor
        ? { ...leave.doctor, _id: leave.doctor._id.toString() }
        : null,
      fromDate: leave.fromDate.toISOString().slice(0, 10),
      toDate: leave.toDate.toISOString().slice(0, 10),
      type: leave.type,
      slots: leave.slots,
      startTime: leave.startTime,
      endTime: leave.endTime,
      reason: leave.reason,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt,
    };

    return sendResponse(true, "Leave fetched successfully", {
      leaves: [responseData],
      pagination: {
        page: 1,
        limit: 1,
        totalCount: 1,
        totalPages: 1,
      },
    });
  }

  // FILTERS
  const whereClause: any = {};

  // Monthly filter using fromDate + toDate overlap
  if (month && year) {
    const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
    const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59);

    whereClause.$or = [
      { fromDate: { $gte: startOfMonth, $lte: endOfMonth } },
      { toDate: { $gte: startOfMonth, $lte: endOfMonth } },
      {
        $and: [
          { fromDate: { $lte: startOfMonth } },
          { toDate: { $gte: endOfMonth } },
        ],
      },
    ];
  }

  // Leave Type Filter
  if (type && type !== "ALL") {
    whereClause.type = type;
  }

  // Doctor Filter
  if (doctor && doctor !== "ALL") {
    whereClause.doctor = doctor;
  }

  // Search Filter
  if (search) {
    whereClause.$or = [
      { reason: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
      { startTime: { $regex: search, $options: "i" } },
      { endTime: { $regex: search, $options: "i" } },
      { slots: { $regex: search, $options: "i" } },
    ];
  }

  //PAGINATION
  const totalCount = await DoctorLeave.countDocuments(whereClause);

  const leaves = await DoctorLeave.find(whereClause)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("doctor")
    .lean();

  const formattedLeaves = leaves.map((leave) => ({
    _id: leave._id.toString(),
    doctor: leave.doctor
      ? { ...leave.doctor, _id: leave.doctor._id.toString() }
      : null,
    fromDate: leave.fromDate,
    toDate: leave.toDate,
    type: leave.type,
    slots: leave.slots,
    startTime: leave.startTime,
    endTime: leave.endTime,
    reason: leave.reason,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
  }));

  // RETURN WITH PAGINATION
  return sendResponse(true, "Leaves fetched successfully", {
    leaves: formattedLeaves,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

export const updateLeave = async (
  id: string,
  data: {
    doctor: string;
    fromDate: string;
    toDate: string;
    type: string;
    slots: string[];
    startTime: string;
    endTime: string;
    reason: string;
  }
) => {
  const leave = await DoctorLeave.findByIdAndUpdate(id, data, { new: true });
  return sendApiResponse(true, "Leave updated successfully", leave);
};

export const deleteLeave = async (id: string) => {
  const leave = await DoctorLeave.findByIdAndDelete(id);
  return sendApiResponse(true, "Leave deleted successfully", leave);
};
