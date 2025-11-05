import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

// Create Table
export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, waiterId, available } = req.body;
    const table = await prisma.table.create({
      data: { tableNumber, capacity, waiterId, available },
    });
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Table
export const updateTable = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tableNumber, capacity, waiterId, available } = req.body;

    const table = await prisma.table.update({
      where: { id },
      data: { tableNumber, capacity, waiterId, available },
    });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟤 (Optional) get all tables for manager
export const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        waiter: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { id: "asc" },
    });
    res.json(tables);
  } catch (err) {
    console.error("❌ Error fetching tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

// export const updateTable = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { tableNumber, capacity, assignedWaiterId, status } = req.body;

//     const updatedTable = await prisma.table.update({
//       where: { id: Number(id) },
//       data: {
//         tableNumber,
//         capacity: parseInt(capacity),
//         assignedWaiterId: Number(assignedWaiterId),
//         status,
//       },
//     });

//     res.json(updatedTable);
//   } catch (err) {
//     console.error("❌ Error updating table:", err);
//     res.status(500).json({ error: "Failed to update table" });
//   }
// };

export const getTablesByWaiter = async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);

    const tables = await prisma.table.findMany({
      where: {
        waiterId: waiterId,      // ✅ Correct field name
        available: true          // ✅ Only available tables
      },
      include: {
        waiter: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(tables);
  } catch (error) {
    console.error("❌ Error fetching tables for waiter:", error);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};
export const checkWaiterTables = async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);
    const assignedTables = await prisma.table.findMany({
      where: { waiterId: waiterId },
    });

    if (assignedTables.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify or delete waiter. ${assignedTables.length} tables are assigned.`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Get available tables only
export const getAvailableTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      where: { available: true },
      include: { waiter: true },
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
