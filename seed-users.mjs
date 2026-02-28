import postgres from "postgres";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(connectionString);

async function seed() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    // Check if admin exists
    const existingAdmin = await sql`SELECT * FROM users WHERE username = 'admin' LIMIT 1`;
    
    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (username, "passwordHash", name, email, role, "creditBalance")
        VALUES ('admin', ${passwordHash}, 'Administrador', 'admin@multboy.com', 'admin', 1000.00)
      `;
      console.log("Admin user created: admin / admin123");
    } else {
      console.log("Admin user already exists");
    }

    const userPasswordHash = await bcrypt.hash("user123", 10);
    const existingUser = await sql`SELECT * FROM users WHERE username = 'user' LIMIT 1`;
    
    if (existingUser.length === 0) {
      await sql`
        INSERT INTO users (username, "passwordHash", name, email, role, "creditBalance")
        VALUES ('user', ${userPasswordHash}, 'Usuário Teste', 'user@multboy.com', 'user', 100.00)
      `;
      console.log("Test user created: user / user123");
    } else {
      console.log("Test user already exists");
    }

  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await sql.end();
  }
}

seed();
