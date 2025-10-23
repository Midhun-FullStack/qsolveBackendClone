const mongoose = require("mongoose");
const User = require("./model/userSchema");
const Department = require("./model/DepartmentSchema");
const Bundle = require("./model/BundleShcema");
const Access = require("./model/accessSchema");
const bcrypt = require("bcrypt");

require("dotenv").config();

const setupAccessData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.mongoURI || "mongodb+srv://midhunfullstack:Midhun@cluster0.ns0oiio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ Database connected successfully");

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: "admin@qsolve.com" });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser = await User.create({
        username: "admin",
        email: "admin@qsolve.com",
        password: hashedPassword,
        firstname: "Admin",
        lastname: "User",
        role: "admin"
      });
      console.log("✅ Admin user created: admin@qsolve.com / admin123");
    }

    // Create sample students if they don't exist
    const sampleStudents = [
      { username: "john_doe", email: "john@student.com", firstname: "John", lastname: "Doe" },
      { username: "jane_smith", email: "jane@student.com", firstname: "Jane", lastname: "Smith" },
      { username: "bob_wilson", email: "bob@student.com", firstname: "Bob", lastname: "Wilson" }
    ];

    const students = [];
    for (const studentData of sampleStudents) {
      let student = await User.findOne({ email: studentData.email });
      if (!student) {
        const hashedPassword = await bcrypt.hash("student123", 10);
        student = await User.create({
          ...studentData,
          password: hashedPassword,
          role: "student"
        });
        console.log(`✅ Student created: ${student.email} / student123`);
      }
      students.push(student);
    }

    // Get existing departments and bundles
    const departments = await Department.find();
    const bundles = await Bundle.find();

    if (bundles.length > 0 && students.length > 0) {
      // Grant access to first student for first bundle
      const existingAccess = await Access.findOne({
        userId: students[0]._id,
        bundleId: bundles[0]._id
      });

      if (!existingAccess) {
        await Access.create({
          userId: students[0]._id,
          bundleId: bundles[0]._id,
          grantedBy: adminUser._id,
          isActive: true,
          notes: "Sample access for testing"
        });
        console.log(`✅ Access granted: ${students[0].username} -> ${bundles[0].title}`);
      }

      // Grant access to second student for second bundle (if exists)
      if (bundles.length > 1) {
        const existingAccess2 = await Access.findOne({
          userId: students[1]._id,
          bundleId: bundles[1]._id
        });

        if (!existingAccess2) {
          await Access.create({
            userId: students[1]._id,
            bundleId: bundles[1]._id,
            grantedBy: adminUser._id,
            isActive: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            notes: "Sample access with expiry"
          });
          console.log(`✅ Access granted with expiry: ${students[1].username} -> ${bundles[1].title}`);
        }
      }
    }

    console.log("\n🎉 Access system setup completed!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@qsolve.com / admin123");
    console.log("Students: john@student.com, jane@student.com, bob@student.com / student123");

  } catch (error) {
    console.error("❌ Error setting up access data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the setup
setupAccessData();