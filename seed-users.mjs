import bcryptjs from "bcryptjs";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Hash passwords
const adminHash = await bcryptjs.hash("10203040", 10);
const userHash = await bcryptjs.hash("password123", 10);

// Insert admin user
await connection.execute(
  "INSERT IGNORE INTO users (username, passwordHash, name, email, role, creditBalance) VALUES (?, ?, ?, ?, ?, ?)",
  ["gael", adminHash, "Gael Admin", "admin@example.com", "admin", "0.00"]
);

// Insert regular user
await connection.execute(
  "INSERT IGNORE INTO users (username, passwordHash, name, email, role, creditBalance) VALUES (?, ?, ?, ?, ?, ?)",
  ["user1", userHash, "User One", "user1@example.com", "user", "100.00"]
);

console.log("Users created successfully!");
await connection.end();
