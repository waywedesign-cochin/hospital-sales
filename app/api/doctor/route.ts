import { addDoctor, deleteDoctor, updateDoctor } from "@/app/controllers/doctorController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { doctorSchema, doctorUpdateSchema } from "@/app/validations/doctorSchema";
import { NextRequest } from "next/server";

// export const POST = withAuth(["ADMIN"])(async (req: NextRequest) => {
//   try {
//     await dbConnect();

//     const [data, errorResponse] = await validate(doctorSchema, req);

//     if (errorResponse) {
//       return sendApiResponse(false, "Validation failed", null);
//     }

//     if (!data) {
//       return sendApiResponse(false, "Invalid request", null);
//     }

//     return await addDoctor(data);
//   } catch (error) {
//     let message = "Server error";

//     if (error instanceof Error) {
//       message = error.message;
//     }
//     return sendApiResponse(false, message, null);
//   }
// });

export const POST = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();

    const data = await req.json(); 

    return await addDoctor({ ...data, clinicId: user.clinicId, userId: user._id });
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const PUT = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(doctorUpdateSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await updateDoctor(user.clinicId, id, user._id, data);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const DELETE = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await deleteDoctor(user.clinicId, id, user._id);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

