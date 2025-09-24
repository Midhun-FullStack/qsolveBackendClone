const mongoose = require("mongoose");
const Department = require("./model/DepartmentSchema");
const Bundle = require("./model/BundleShcema");

require("dotenv").config();

const sampleDepartments = [
  { department: "Mechanical Engineering" },
  { department: "Civil Engineering" },
  { department: "Computer Science Engineering" },
  { department: "Electrical Engineering" },
  { department: "Electronics Engineering" }
];

const sampleBundles = [
  {
    title: "Mechanical Engineering - Semester 4",
    description: "Complete question bank for Mechanical Engineering Semester 4",
    departmentID: null, // Will be set after creating departments
    price: 148,
    products: [] // Empty products array for now
  },
  {
    title: "Civil Engineering - Semester 4",
    description: "Complete question bank for Civil Engineering Semester 4",
    departmentID: null, // Will be set after creating departments
    price: 148,
    products: [] // Empty products array for now
  },
  {
    title: "Computer Science - Semester 4",
    description: "Complete question bank for Computer Science Semester 4",
    departmentID: null, // Will be set after creating departments
    price: 148,
    products: [] // Empty products array for now
  }
];

async function setupSampleData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.mongoURI || "mongodb+srv://midhunfullstack:Midhun@cluster0.ns0oiio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ Database connected successfully");

    // Clear existing data
    await Department.deleteMany({});
    await Bundle.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Insert sample departments
    const departments = await Department.insertMany(sampleDepartments);
    console.log("✅ Sample departments created:", departments.length);

    // Insert sample bundles
    const bundles = await Bundle.insertMany(sampleBundles);
    console.log("✅ Sample bundles created:", bundles.length);

    // Update bundles with department ObjectIds
    for (let i = 0; i < bundles.length; i++) {
      const department = departments.find(d => d.department === sampleDepartments[i].department);
      if (department) {
        bundles[i].departmentID = department._id;
        await bundles[i].save();
      }
    }

    console.log("✅ Sample data setup completed!");
    console.log("\n📋 Available Departments:");
    departments.forEach(dept => {
      console.log(`- ${dept.department} (ID: ${dept._id})`);
    });

    console.log("\n📚 Available Bundles:");
    bundles.forEach(bundle => {
      console.log(`- ${bundle.title} (${bundle.departmentID})`);
    });

  } catch (error) {
    console.error("❌ Error setting up sample data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the setup
setupSampleData();
