import { cookies } from "next/headers";
import { signJwt } from "../lib/jwt";
import User from "../models/User";
import Organization from "../models/Organization";
import Subscription from "../models/Subscription";
import { sendResponse } from "../utils/responseHandler";
import bcrypt from "bcrypt";
import { sendApiResponse } from "../utils/nextResponseHandler";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetMail";
import { generateApiKey } from "../lib/apiKey";
// ================= SIGN UP =================
export const signUp = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  organizationId?: string;
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    const userExists = await User.findOne({
      email: lowercasedEmail,
      organizationId: data.organizationId,
    });
    if (userExists) {
      return sendResponse(false, "User already exists in this organization");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      ...data,
      email: lowercasedEmail,
      password: hashedPassword,
    });

    return sendResponse(true, "User created successfully");
  } catch (error) {
    console.error("Signup Error:", error);
    return sendResponse(false, "Something went wrong during signup");
  }
};

// ================= REGISTER CLINIC =================
export const registerClinic = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  clinicName: string;
  clinicPhone?: string;
  clinicAddress?: string;
  departments?: string[];
  plan?: string;
  billingCycle?: "MONTHLY" | "YEARLY";
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email: lowercasedEmail });
    if (existingUser) {
      return sendResponse(false, "This email is already registered");
    }

    // 1. Generate unique slug for clinic
    let baseSlug = data.clinicName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Determine plan config
    const isPaidPlan = data.plan && data.plan !== "free";
    const planPricing: Record<
      string,
      { monthly: number; yearly: number; maxDoctors: number; maxStaff: number }
    > = {
      BASIC: { monthly: 999, yearly: 9990, maxDoctors: 2, maxStaff: 5 },
      PRO: { monthly: 2999, yearly: 29990, maxDoctors: 999, maxStaff: 999 },
      ENTERPRISE: {
        monthly: 9999,
        yearly: 99990,
        maxDoctors: 999,
        maxStaff: 999,
      },
    };

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30-day trial

    const planConfig = isPaidPlan
      ? planPricing[data.plan!.toUpperCase()]
      : null;

    const newOrganization = await Organization.create({
      name: data.clinicName,
      slug,
      email: lowercasedEmail,
      phone: data.clinicPhone,
      address: data.clinicAddress,
      departments: data.departments?.length
        ? data.departments
        : ["General Medicine"],
      plan: isPaidPlan ? data.plan!.toLowerCase() : "free",
      trialEndsAt: isPaidPlan ? undefined : trialEndsAt,
      subscriptionStatus: isPaidPlan ? "ACTIVE" : "TRIAL",
      maxDoctors: planConfig?.maxDoctors || 2,
      maxStaff: planConfig?.maxStaff || 5,
      apiKey: generateApiKey(),
    });

    // 3. Create the Admin User
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newAdmin = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: lowercasedEmail,
      password: hashedPassword,
      role: "ADMIN",
      organizationId: newOrganization._id,
    });

    // 4. Update Organization Owner ID
    await Organization.findByIdAndUpdate(newOrganization._id, {
      ownerId: newAdmin._id,
    });

    // 5. If paid plan, create a mock subscription
    if (isPaidPlan && planConfig) {
      const billingCycle = data.billingCycle || "MONTHLY";
      const amount =
        billingCycle === "YEARLY" ? planConfig.yearly : planConfig.monthly;
      const expiresAt = new Date();
      if (billingCycle === "YEARLY") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await Subscription.create({
        organizationId: newOrganization._id,
        plan: data.plan!.toUpperCase() as "BASIC" | "PRO" | "ENTERPRISE",
        billingCycle,
        amount,
        currency: "INR",
        paymentId: `mock_pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        orderId: `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        paymentMethod: "MOCK",
        status: "PAID",
        startsAt: new Date(),
        expiresAt,
        autoRenew: true,
      });
    }

    // 5. Auto login
    const token = signJwt(
      {
        _id: newAdmin._id.toString(),
        role: newAdmin.role,
        organizationId: newOrganization._id.toString(),
        organizationSlug: newOrganization.slug,
      },
      "7d",
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return sendResponse(true, "Clinic registered successfully", {
      _id: newAdmin._id.toString(),
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      email: newAdmin.email,
      role: newAdmin.role,
      organizationId: newOrganization._id.toString(),
    });
  } catch (error: any) {
    console.error("Clinic Registration Error:", error);
    if (error.code === 11000) {
      return sendResponse(false, "This email is already registered");
    }
    return sendResponse(
      false,
      "Something went wrong during clinic registration: " +
        (error.message || error.toString()),
    );
  }
};

// ================= SIGN IN =================
export const signIn = async (data: {
  email: string;
  password: string;
  organizationId?: string;
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    const query: any = { email: lowercasedEmail };
    if (data.organizationId) query.organizationId = data.organizationId;

    const matches = await User.find(query);
    if (!matches.length) {
      return sendResponse(false, "Invalid email or password");
    }

    const validMatches = [];
    for (const u of matches) {
      const ok = await bcrypt.compare(data.password, u.password);
      if (ok) validMatches.push(u);
    }

    if (!validMatches.length) {
      return sendResponse(false, "Invalid email or password");
    }

    if (validMatches.length > 1) {
      const orgIds = validMatches.map((u) => u.organizationId);
      const organizations = await Organization.find({
        _id: { $in: orgIds },
      })
        .select("name slug")
        .lean();

      // .lean() + manual mapping: Mongoose documents (and their
      // ObjectId fields) aren't plain objects, so they can't cross
      // the server-action -> client-component boundary as-is.
      return sendResponse(false, "Select a clinic to continue", {
        requiresOrgSelection: true,
        organizations: organizations.map((org) => ({
          _id: org._id.toString(),
          name: org.name,
          slug: org.slug,
        })),
      });
    }

    const user = validMatches[0];

    if (user.role === "GUEST") {
      return sendResponse(false, "Access denied. Contact admin.");
    }

    const organization = await Organization.findById(
      user.organizationId,
    ).select("slug");
    const organizationSlug = organization ? organization.slug : null;

    const token = signJwt(
      {
        _id: user._id,
        role: user.role,
        organizationId: user.organizationId,
        organizationSlug,
      },
      "7d",
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return sendResponse(true, "Login successful", {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId?.toString() || null,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return sendResponse(false, "Something went wrong during login");
  }
};

//logout
export const logout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return sendResponse(true, "Logged out successfully");
  } catch (error) {
    return sendResponse(false, "Logout failed");
  }
};

export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById({ _id: id });
  if (!user) {
    return sendApiResponse(false, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return sendApiResponse(false, "Invalid credentials");
  }
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return sendApiResponse(
      false,
      "New password cannot be same as old password",
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate({ _id: id }, { password: hashedPassword });
  return sendApiResponse(true, "Password changed successfully");
};

//forgot password
export const forgotPassword = async (
  email: string,
  organizationId?: string,
) => {
  const lowercasedEmail = email.toLowerCase();
  const query: any = { email: lowercasedEmail };
  if (organizationId) query.organizationId = organizationId;

  const matches = await User.find(query);

  if (!matches.length) {
    return sendApiResponse(
      true,
      "If an account exists, a password reset link has been sent",
    );
  }

  if (matches.length > 1 && !organizationId) {
    const orgIds = matches.map((u) => u.organizationId);
    const organizations = await Organization.find({
      _id: { $in: orgIds },
    })
      .select("name slug")
      .lean();

    return sendApiResponse(false, "Select a clinic to continue", {
      requiresOrgSelection: true,
      organizations: organizations.map((org) => ({
        _id: org._id.toString(),
        name: org.name,
        slug: org.slug,
      })),
    });
  }

  const user = matches[0];
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await User.findOneAndUpdate(
    { email: lowercasedEmail },
    { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpiry },
    { new: true },
  );
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/forgot-password?token=${resetToken}`;
  if (resetLink) {
    await sendPasswordResetEmail(user, resetLink);
  }
  return sendApiResponse(
    true,
    "If an account exists, a password reset link has been sent",
  );
};

//reset password
export const resetPassword = async (token: string, password: string) => {
  const user = await User.findOne({ resetPasswordToken: token });
  if (user) {
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return sendApiResponse(false, "Token has expired");
    }
  }
  if (!user) {
    return sendApiResponse(false, "Invalid or expired token");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    },
  );
  return sendApiResponse(true, "Password reset successful");
};
