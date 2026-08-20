import Enquiry from "../models/Enquiry";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import User, { IUser } from "../models/User";
import EnquiryActivity from "../models/EnquiryActivity";
import Patient from "../models/Patient";
export interface EnquirySummary {
  totalEnquiries: number;
  appointmentsBooked: number;
  contacted: number;
  followUps: number;
  skin: number;
  hair: number;
  body: number;
}
export const createEnquiry = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  treatmentCategory: string;
  message: string;
  source: string;
}) => {
  // Identify patient by phone or create a new one
  let patient = await Patient.findOne({ phone: data.phone });
  if (!patient) {
    patient = await Patient.create({
      firstName: data.firstName,
      lastName: data.lastName || "",
      email: data.email,
      phone: data.phone,
    });
  }

  const newEnquiry = await Enquiry.create({
    ...data,
    patientId: patient._id,
  });
  return sendApiResponse(true, "Enquiry created successfully", newEnquiry);
};

export const getEnquiries = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  treatmentCategory?: string,
  status?: string,
  source?: string,
  fromDate?: string,
  toDate?: string,
) => {
  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};
  if (search) {
    whereClause.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { treatmentCategory: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
    ];
  }
  if (treatmentCategory) {
    whereClause.treatmentCategory = treatmentCategory;
  }
  if (status) {
    whereClause.status = { $regex: status, $options: "i" };
  }
  if (source) {
    whereClause.source = { $regex: source, $options: "i" };
  }
  if (fromDate || toDate) {
    whereClause.createdAt = {};

    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      whereClause.createdAt.$gte = start;
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt.$lte = end;
    }
  }

  const totalCount = await Enquiry.countDocuments(whereClause);
  const enquiries = await Enquiry.find(whereClause)
    .populate<{ handledBy: IUser }>("handledBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  //  Get enquiry IDs
  const enquiryIds = enquiries.map((e) => e._id);

  // Fetch latest activity per enquiry
  const latestActivities = await EnquiryActivity.aggregate([
    {
      $match: {
        enquiryId: { $in: enquiryIds },
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $group: {
        _id: "$enquiryId",
        latest: { $first: "$$ROOT" },
      },
    },

    // Populate createdBy
    {
      $lookup: {
        from: "users",
        localField: "latest.createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    },
    {
      $unwind: {
        path: "$createdByUser",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  //  Convert to map
  const activityMap = new Map(
    latestActivities.map((a) => [
      a._id.toString(),
      {
        ...a.latest,
        createdByUser: a.createdByUser,
      },
    ]),
  );
  const enquiryList = enquiries.map((enquiry) => {
    const latest = activityMap.get(enquiry._id.toString());

    return {
      _id: enquiry._id.toString(),
      firstName: enquiry.firstName,
      lastName: enquiry.lastName,
      email: enquiry.email,
      phone: enquiry.phone,
      treatmentCategory: enquiry.treatmentCategory,
      message: enquiry.message,
      status: latest?.type ?? enquiry.status,
      handledBy: latest?.createdByUser
        ? {
            _id: latest.createdByUser._id.toString(),
            firstName: latest.createdByUser.firstName,
            lastName: latest.createdByUser.lastName,
          }
        : null,
      staffNotes: latest?.note ?? enquiry.staffNotes,
      source: enquiry.source,
      createdAt: enquiry.createdAt,
    };
  });

  return sendResponse(true, "Enquiries fetched successfully", {
    enquiries: enquiryList,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

//update status
export const updateEnquiryStatus = async (
  id: string,
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED",
  handledBy?: string,
  staffNotes?: string,
) => {
  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return sendApiResponse(false, "Enquiry not found");
  }

  // NEW enquiries should not require handledBy
  if (status !== "NEW" && !handledBy) {
    return sendApiResponse(false, "handledBy is required for this status");
  }

  const updatedEnquiry = await Enquiry.findByIdAndUpdate(
    id,
    {
      status,
      handledBy: handledBy ?? enquiry.handledBy,
      staffNotes,
    },
    { new: true },
  );

  return sendApiResponse(true, "Enquiry status updated successfully", {
    enquiry: updatedEnquiry,
  });
};

//delete enquiry
export const deleteEnquiry = async (id: string) => {
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    return sendApiResponse(false, "Enquiry not found");
  }
  await Enquiry.findByIdAndDelete(id);
  return sendApiResponse(true, "Enquiry deleted successfully");
};

//enquiry report
export const getEnquiryReport = async (year?: string) => {
  // Default year → current year
  const currentYear = year ? Number(year) : new Date().getFullYear();

  // UTC-safe year range
  const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

  const rawReport = await Enquiry.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },

    // Group by month + status
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },

    // Group by month and calculate totals
    {
      $group: {
        _id: "$_id.month",

        totalEnquiries: { $sum: "$count" },

        appointmentsBooked: {
          $sum: {
            $cond: [
              { $eq: ["$_id.status", "APPOINTMENT_BOOKED"] },
              "$count",
              0,
            ],
          },
        },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  /* -------- Ensure all 12 months exist -------- */

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const normalizedReport = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const found = rawReport.find((r) => r._id === monthIndex);

    return {
      month: monthIndex,
      monthName: MONTHS[i],
      totalEnquiries: found?.totalEnquiries || 0,
      appointmentsBooked: found?.appointmentsBooked || 0,
    };
  });

  return sendResponse(
    true,
    "Monthly enquiry report fetched successfully",
    normalizedReport,
  );
};

//enquiry summary
export const getEnquirySummary = async (fromDate?: string, toDate?: string) => {
  /* ---------------- Snapshot Date Logic ---------------- */
  let snapshotMatch: any = {};
  let overviewMatch: any = {};

  if (fromDate || toDate) {
    const start = fromDate ? new Date(fromDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = toDate ? new Date(toDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Range applies to BOTH snapshot & overview
    snapshotMatch.createdAt = { $gte: start, $lte: end };
    overviewMatch.createdAt = { $gte: start, $lte: end };
  } else {
    // Default SNAPSHOT = TODAY
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    snapshotMatch.createdAt = {
      $gte: todayStart,
      $lte: todayEnd,
    };

    // Default OVERVIEW = ALL (no date filter)
    overviewMatch = {};
  }

  /* ---------------- TODAY / RANGE SNAPSHOT ---------------- */
  const snapshot = await Enquiry.aggregate([
    { $match: snapshotMatch },
    {
      $group: {
        _id: null,

        newEnquiries: { $sum: 1 },

        contacted: {
          $sum: {
            $cond: [{ $eq: ["$status", "CONTACTED"] }, 1, 0],
          },
        },

        appointmentsBooked: {
          $sum: {
            $cond: [{ $eq: ["$status", "APPOINTMENT_BOOKED"] }, 1, 0],
          },
        },

        followUps: {
          $sum: {
            $cond: [{ $eq: ["$status", "FOLLOW_UP"] }, 1, 0],
          },
        },
      },
    },
  ]);

  /* ---------------- MONTHLY / ALL OVERVIEW ---------------- */
  const overview = await Enquiry.aggregate([
    { $match: overviewMatch },
    {
      $group: {
        _id: "$treatmentCategory",
        count: { $sum: 1 },
        appointmentsBooked: {
          $sum: {
            $cond: [{ $eq: ["$status", "APPOINTMENT_BOOKED"] }, 1, 0],
          },
        },
      },
    },
  ]);

  let totalEnquiries = 0;
  let totalAppointmentsBooked = 0;
  let topCategory: "SKIN" | "HAIR" | "BODY" | null = null;
  let maxCount = 0;

  overview.forEach((item) => {
    if (!item._id) return;

    totalEnquiries += item.count;
    totalAppointmentsBooked += item.appointmentsBooked;

    if (item.count > maxCount) {
      maxCount = item.count;
      topCategory = item._id;
    }
  });

  const conversionRate =
    totalEnquiries === 0
      ? 0
      : Math.round((totalAppointmentsBooked / totalEnquiries) * 100);

  /* ---------------- FINAL RESPONSE ---------------- */
  return sendResponse(true, "Enquiry summary fetched successfully", {
    newEnquiries: snapshot[0]?.newEnquiries ?? 0,
    contacted: snapshot[0]?.contacted ?? 0,
    appointmentsBooked: snapshot[0]?.appointmentsBooked ?? 0,
    followUps: snapshot[0]?.followUps ?? 0,
    // Monthly overview
    totalEnquiries,
    conversionRate,
    topCategory,
  });
};

// In your enquiryController
export async function getEnquiriesForExport(filters: any) {
  const query: any = {};

  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters.status && filters.status !== "ALL") query.status = filters.status;
  if (filters.treatmentCategory && filters.treatmentCategory !== "ALL")
    query.treatmentCategory = filters.treatmentCategory;
  if (filters.source && filters.source !== "ALL") query.source = filters.source;
  if (filters.fromDate || filters.toDate) {
    query.createdAt = {};
    if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
  }

  return Enquiry.find(query).populate("handledBy", "firstName").lean();
}
