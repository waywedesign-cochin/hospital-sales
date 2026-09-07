const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

mongoose.connect(process.env.MONGODB_URI);

const orgSchema = new mongoose.Schema({ strict: false });
const Organization = mongoose.model("Organization", orgSchema, "organizations");

async function check() {
  try {
    const orgs = await Organization.find();
    console.log("Found orgs:", orgs.length);
    for (const org of orgs) {
      if (!org.apiKey) {
         console.log(`Org ${org.name} missing apiKey`);
      }
      if (!org.email) {
         console.log(`Org ${org.name} missing email`);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
