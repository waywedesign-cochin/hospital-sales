import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../app/models/User";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.NODE_ENV === "production" ? process.env.MONGODB_URL : (process.env.MONGODB_URL_TEST || process.env.MONGODB_URL);

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URL or MONGODB_URL_TEST environment variable inside .env.local");
}

const seedPlatformAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = "admin@platform.com";
    const password = "adminpassword";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Platform admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName: "Platform",
      lastName: "Owner",
      email: email,
      password: hashedPassword,
      role: "PLATFORM_ADMIN",
      // Notice: No organizationId because this user is platform-wide
    });

    console.log("Platform admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed platform admin:", error);
    process.exit(1);
  }
};

seedPlatformAdmin();
