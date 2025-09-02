const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User.js");

async function seed() {
  try {
    // ✅ Get args
    const [,, command, arg2, arg3, arg4] = process.argv;

    await mongoose.connect(
      "mongodb+srv://akarn6_db_user:92G3rXA8aswn8G0q@cluster0.btd99eu.mongodb.net/logistics?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("✅ Connected to MongoDB Atlas");

    // ========================
    // List all users
    // ========================
    if (command === "list") {
      const users = await User.find({}, { username: 1, role: 1, _id: 0 });
      if (users.length === 0) {
        console.log("ℹ️ No users found in database.");
      } else {
        console.log("📋 Users in DB:");
        users.forEach(u => {
          console.log(`- ${u.username} (${u.role})`);
        });
      }
      process.exit();
    }

    // ========================
    // Create new user
    // ========================
    if (command && arg2 && arg3) {
      const username = command;
      const password = arg2;
      const role = arg3;

      if (!["admin", "dispatcher"].includes(role)) {
        console.error("❌ Role must be either 'admin' or 'dispatcher'");
        process.exit(1);
      }

      // Check if exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log(`ℹ️ User '${username}' already exists with role '${existingUser.role}'`);
        process.exit();
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword, role });
      await newUser.save();

      console.log(`✅ User created: username=${username}, password=${password}, role=${role}`);
      process.exit();
    }

    // ========================
    // Invalid usage
    // ========================
    console.log("❌ Invalid usage");
    console.log("   To create user: node seedUsers.js <username> <password> <role>");
    console.log("   Example: node seedUsers.js admin admin123 admin");
    console.log("   Example: node seedUsers.js dispatcher dispatcher123 dispatcher");
    console.log("   To list users: node seedUsers.js list");
    process.exit(1);

  } catch (err) {
    console.error("❌ Error seeding/listing users:", err);
    process.exit(1);
  }
}

seed();
