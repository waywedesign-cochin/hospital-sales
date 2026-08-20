import Enquiry from "../models/Enquiry";
import EnquiryActivity from "../models/EnquiryActivity";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";

export const addEnquiryActivity = async (data: {
  enquiryId: string;
  type: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";
  note: string;
  date?: Date;
  createdBy?: string;
}) => {
  try {
    const enquiry = await Enquiry.findById(data.enquiryId);
    if (!enquiry) {
      return sendApiResponse(false, "Enquiry not found");
    }
    const updateEnquiry = await Enquiry.findByIdAndUpdate(
      data.enquiryId,
      {
        status: data.type,
        handledBy: data.createdBy,
        staffNotes: data.note,
      },
      { new: true },
    );
    const newActivity = await EnquiryActivity.create({
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    });

    return sendApiResponse(true, "Enquiry activity added successfully", {
      activity: newActivity,
    });
  } catch (error) {
    console.error("Error adding enquiry activity:", error);
    sendApiResponse(false, "Failed to add enquiry activity");
  }
};

export const getEnquiryActivities = async (
  enquiryId: string,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const skip = (page - 1) * limit;

    // Count total
    const totalCount = await EnquiryActivity.countDocuments({ enquiryId });

    // Fetch paginated data
    const activities = await EnquiryActivity.find({ enquiryId })
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format response
    const activityList = activities.map((activity) => ({
      _id: activity._id.toString(),
      enquiryId: activity.enquiryId.toString(),
      type: activity.type,
      note: activity.note,
      date: activity.date ? activity.date.toISOString() : undefined,

      createdBy: activity.createdBy
        ? {
            firstName: (activity.createdBy as any).firstName,
            lastName: (activity.createdBy as any).lastName,
          }
        : null,
      createdAt: activity.createdAt
        ? activity.createdAt.toISOString()
        : undefined,
    }));

    return sendResponse(true, "Activities fetched successfully", {
      activities: activityList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    let message = "Failed to fetch activities";
    if (error instanceof Error) {
      message = error.message;
    }

    return sendResponse(false, message, null);
  }
};

export const updateEnquiryActivity = async (
  activityId: string,
  data: {
    type?: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";
    note?: string;
    date?: Date;
  },
) => {
  try {
    const enquiryActivity = await EnquiryActivity.findById(activityId);
    if (!enquiryActivity) {
      return sendApiResponse(false, "Enquiry activity not found");
    }
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      enquiryActivity.enquiryId,
      {
        status: data.type,
        staffNotes: data.note,
      },
      { new: true },
    );
    const updatedActivity = await EnquiryActivity.findByIdAndUpdate(
      activityId,
      {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      { new: true },
    );

    if (!updatedActivity) {
      return sendApiResponse(false, "Enquiry activity not found");
    }

    return sendApiResponse(true, "Enquiry activity updated successfully", {
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error updating enquiry activity:", error);
    sendApiResponse(false, "Failed to update enquiry activity");
  }
};

export const deleteEnquiryActivity = async (id: string) => {
  try {
    const deletedActivity = await EnquiryActivity.findByIdAndDelete(id);

    if (!deletedActivity) {
      return sendApiResponse(false, "Enquiry activity not found");
    }

    return sendApiResponse(true, "Enquiry activity deleted successfully");
  } catch (error) {
    console.error("Error deleting enquiry activity:", error);
    sendApiResponse(false, "Failed to delete enquiry activity");
  }
};
