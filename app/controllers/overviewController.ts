import Appointment from "../models/Appointment";
import Enquiry from "../models/Enquiry";
import { sendResponse } from "../utils/responseHandler";

export const dashboardtotalSummaries = async (clinicId: string, year?: string) => {
  const whereClause: any = { clinicId };

  if (year) {
    whereClause.createdAt = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };
  }

  const [
    totalAppointments,
    totalEnquiries,
    completedAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    Appointment.countDocuments(whereClause),
    Enquiry.countDocuments(whereClause),
    Appointment.countDocuments({ ...whereClause, status: "COMPLETED" }),
    Appointment.countDocuments({ ...whereClause, status: "CANCELLED" }),
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

export const doctorsAppointmentsSummary = async (clinicId: string, year?: string) => {
  const matchStage: any = { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) };

  if (year) {
    matchStage.createdAt = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };
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
    doctorsSummary
  );
};

export const getQuickOverviewSummary = async (clinicId: string, date: string) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const todayQuery = {
    clinicId,
    date: { $gte: start, $lte: end },
  };

  const tomorrowStart = new Date(start);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const tomorrowEnd = new Date(end);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  /* -------- Today Appointments -------- */
  const todayAppointmentsAgg = await Appointment.aggregate([
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
  const consultationAgg = await Appointment.aggregate([
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

  /* -------- Tomorrow Schedule -------- */
  const tomorrowAppointments = await Appointment.countDocuments({
    clinicId,
    date: { $gte: tomorrowStart, $lte: tomorrowEnd },
  });

  return sendResponse(true, "Quick overview fetched", {
    todayAppointments,
    consultationBreakdown,
    tomorrowAppointments,
  });
};
