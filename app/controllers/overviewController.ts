import Appointment from "../models/Appointment";
import Enquiry from "../models/Enquiry";
import { sendResponse } from "../utils/responseHandler";
import TreatmentCategory from "../models/TreatmentCategory";
import Doctor from "../models/Doctor";
import mongoose from "mongoose";
import { resolveDoctorScope, RequestingUser } from "../utils/DoctorScope";

export const getSetupStatus = async (organizationId: string) => {
  const [categoriesCount, doctorsCount] = await Promise.all([
    TreatmentCategory.countDocuments({ organizationId }),
    Doctor.countDocuments({ organizationId }),
  ]);

  return sendResponse(true, "Setup status fetched", {
    hasTreatmentCategories: categoriesCount > 0,
    hasDoctors: doctorsCount > 0,
  });
};

export const dashboardtotalSummaries = async (
  organizationId: string,
  year?: string,
  requestingUser?: RequestingUser,
) => {
  const whereClause: any = { organizationId };

  if (year) {
    whereClause.createdAt = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };
  }

  const doctorScope = requestingUser
    ? await resolveDoctorScope(organizationId, requestingUser)
    : null;

  // Appointment counts are scoped to the staff member's assigned doctors.
  const appointmentWhereClause = { ...whereClause };
  if (doctorScope) {
    appointmentWhereClause.doctor = { $in: doctorScope };
  }

  // NOTE: Enquiry currently has no `doctor` field to scope by in this
  // codebase. If Enquiry does carry a doctor/assignedDoctor reference,
  // add the same $in filter here so STAFF dashboards don't see org-wide
  // enquiry totals beyond their assigned doctors.
  const enquiryWhereClause = { ...whereClause };

  const [
    totalAppointments,
    totalEnquiries,
    completedAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    Appointment.countDocuments(appointmentWhereClause),
    Enquiry.countDocuments(enquiryWhereClause),
    Appointment.countDocuments({ ...appointmentWhereClause, status: "COMPLETED" }),
    Appointment.countDocuments({ ...appointmentWhereClause, status: "CANCELLED" }),
  ]);

  return sendResponse(true, "Dashboard summary totals fetched successfully", {
    totalSummary: {
      totalAppointments,
      totalEnquiries,
      completedAppointments,
      cancelledAppointments,
    },
  });
};

export const doctorsAppointmentsSummary = async (
  organizationId: string,
  year?: string,
  requestingUser?: RequestingUser,
) => {
  const matchStage: any = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
  };

  if (year) {
    matchStage.createdAt = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };
  }

  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(organizationId, requestingUser);
    if (doctorScope) {
      if (doctorScope.length === 0) {
        // Staff with no assigned doctors — nothing to show.
        return sendResponse(
          true,
          "Doctors appointments summary fetched successfully",
          [],
        );
      }
      matchStage.doctor = {
        $in: doctorScope.map((id) => new mongoose.Types.ObjectId(id.toString())),
      };
    }
  }

  const doctorsSummary = await Appointment.aggregate([
    { $match: matchStage },

    {
      $group: {
        _id: "$doctor",
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: {
            $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
          },
        },
        cancelledAppointments: {
          $sum: {
            $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0],
          },
        },
      },
    },

    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },

    {
      $project: {
        _id: 0,
        doctorId: { $toString: "$doctor._id" },
        name: {
          $concat: [
            "$doctor.prefix",
            " ",
            "$doctor.firstName",
            " ",
            "$doctor.lastName",
          ],
        },
        totalAppointments: 1,
        completedAppointments: 1,
        cancelledAppointments: 1,
        completionPercentage: {
          $cond: [
            { $eq: ["$totalAppointments", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$completedAppointments", "$totalAppointments"],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
          ],
        },
      },
    },

    { $sort: { totalAppointments: -1 } },
  ]);

  return sendResponse(
    true,
    "Doctors appointments summary fetched successfully",
    doctorsSummary,
  );
};

export const getQuickOverviewSummary = async (
  organizationId: string,
  date: string,
  range: "daily" | "weekly" | "monthly" = "daily",
  requestingUser?: RequestingUser,
) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  let end = new Date(date);

  let nextStart = new Date(start);
  let nextEnd = new Date(start);

  if (range === "daily") {
    end.setHours(23, 59, 59, 999);
    nextStart.setDate(nextStart.getDate() + 1);
    nextEnd = new Date(nextStart);
    nextEnd.setHours(23, 59, 59, 999);
  } else if (range === "weekly") {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);
    nextStart.setHours(0, 0, 0, 0);

    nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 6);
    nextEnd.setHours(23, 59, 59, 999);
  } else if (range === "monthly") {
    start.setDate(1);

    end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);
    nextStart.setHours(0, 0, 0, 0);

    nextEnd = new Date(nextStart);
    nextEnd.setMonth(nextStart.getMonth() + 1);
    nextEnd.setDate(0);
    nextEnd.setHours(23, 59, 59, 999);
  }

  const doctorScope = requestingUser
    ? await resolveDoctorScope(organizationId, requestingUser)
    : null;

  const emptyScope = !!doctorScope && doctorScope.length === 0;

  const todayQuery: any = {
    organizationId,
    date: { $gte: start, $lte: end },
  };
  if (doctorScope) {
    todayQuery.doctor = { $in: doctorScope };
  }

  const todayAppointmentsAgg = emptyScope
    ? []
    : await Appointment.aggregate([
        { $match: todayQuery },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

  const todayAppointments = {
    total: 0,
    completed: 0,
    pending: 0,
  };

  todayAppointmentsAgg.forEach((item) => {
    todayAppointments.total += item.count;
    if (item._id === "COMPLETED") todayAppointments.completed = item.count;
    if (item._id === "SCHEDULED") todayAppointments.pending = item.count;
  });

  /* -------- Consultation Breakdown -------- */
  const consultationAgg = emptyScope
    ? []
    : await Appointment.aggregate([
        { $match: todayQuery },
        {
          $group: {
            _id: "$treatmentCategory",
            count: { $sum: 1 },
          },
        },
      ]);

  const consultationBreakdown: Record<string, number> = {};
  consultationAgg.forEach((item) => {
    consultationBreakdown[item._id] = item.count;
  });

  /* -------- Next Period Schedule -------- */
  const tomorrowQuery: any = {
    organizationId,
    date: { $gte: nextStart, $lte: nextEnd },
  };
  if (doctorScope) {
    tomorrowQuery.doctor = { $in: doctorScope };
  }

  const tomorrowAppointments = emptyScope
    ? 0
    : await Appointment.countDocuments(tomorrowQuery);

  return sendResponse(true, "Quick overview fetched", {
    todayAppointments,
    consultationBreakdown,
    tomorrowAppointments,
  });
};