import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const staffController = {
  async createStaff(req, res) {
    try {
      const { firstName, lastName, email, username, password, gender, role } = req.body;

      if (!username || !password || !role)
        return res.status(400).json({ message: "Username, password & role required" });

      // Hash the password
      const hashed = await bcrypt.hash(password, 10);

      // Save to DB
      const staff = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          gender,
          password: hashed,
          role, // e.g. "Waiter" or "Chef"
        },
      });

      res.status(201).json({ message: "Staff created successfully", staff });
    } catch (error) {
      console.error("❌ Error creating staff:", error);
      res.status(500).json({ message: "Server error creating staff" });
    }
  },

  async listStaff(req, res) {
    try {
      const staff = await prisma.user.findMany({
        where: {
          NOT: { role: "Manager" }, // exclude manager
        },
      });
      res.json(staff);
    } catch (error) {
      console.error("❌ Error fetching staff:", error);
      res.status(500).json({ message: "Server error fetching staff" });
    }
  },


  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const { firstName, lastName, username, email, gender, role, password } = req.body;

      const updateData = {
        firstName,
        lastName,
        username,
        email,
        gender,
        role,
      };

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      res.json(updated);
    } catch (error) {
      console.error("❌ Error updating staff:", error);
      res.status(500).json({ message: "Server error updating staff" });
    }
  },

  // 🔹 Delete staff
  async remove(req, res) {
  try {
    const id = Number(req.params.id);

    // 1️⃣ Check if staff exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: "Staff not found" });

    // 2️⃣ If staff is a waiter, check if any tables are assigned
    if (existing.role === 'waiter') {
      const assignedTables = await prisma.table.findMany({
        where: { waiterId: id },
      });

      if (assignedTables.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete waiter — ${assignedTables.length} tables are assigned. Please unassign them first.`,
        });
      }
    }

    // 3️⃣ Safe to delete now
    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting staff:", error);
    res.status(500).json({ message: "Server error deleting staff" });
  }
},

  getWaiters: async (req, res) => {
    try {
      const waiters = await prisma.user.findMany({
        where: {
          role: {
            in: ["Waiter", "waiter"]
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });
      res.json(waiters);
      console.log(waiters)
    } catch (err) {
      console.error("Error fetching waiters:", err);
      res.status(500).json({ error: "Failed to fetch waiters" });
    }
  }
};
