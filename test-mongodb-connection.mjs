import mongoose from "mongoose";

const uri = process.env.RESTORE_MONGODB_URI;
if (!uri) throw new Error("RESTORE_MONGODB_URI is not set.");

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected successfully.");
  console.log("Database selected:", mongoose.connection.name);
  console.log(
    "Product documents:",
    await mongoose.connection.db.collection("products").countDocuments()
  );
} catch (error) {
  console.error("Connection failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
