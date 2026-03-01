import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =====================================================
   🟢 CREATE TABLE
===================================================== */
export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, waiterId, available } = req.body;

    const table = await prisma.table.create({
      data: { tableNumber, capacity, waiterId, available },
    });

    res.status(201).json(table);
  } catch (err) {
    console.error("❌ Error creating table:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   🟠 UPDATE TABLE
===================================================== */
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
    console.error("❌ Error updating table:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   🟤 GET ALL TABLES (Manager)
===================================================== */
export const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        waiter: { select: { firstName: true, lastName: true } },
      },
      orderBy: { id: "asc" },
    });

    res.json(tables);
  } catch (err) {
    console.error("❌ Error fetching tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

/* =====================================================
   🟩 WAITER VIEW — BILLING AWARE TABLES
===================================================== */
export const getTablesByWaiter = async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);

    const tables = await prisma.table.findMany({
      where: { waiterId },
      include: {
        waiter: { select: { firstName: true, lastName: true } },

        billings: {
          where: { status: "Unbilled" }, // ACTIVE BILLING ONLY
          include: {
            orders: {
              orderBy: { createdAt: "desc" },
              include: {
                orderItems: {
                  include: {
                    menuItem: { select: { itemName: true, price: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // 🔥 FORMAT RESPONSE CLEANLY
    const formatted = tables.map((t) => {
      const activeBilling = t.billings[0] || null;
      const latestOrder = activeBilling?.orders[0] || null;

      return {
        id: t.id,
        tableNumber: t.tableNumber,
        capacity: t.capacity,

        // Auto-derive availability
        available: true,

        waiter: t.waiter,

        activeBilling: activeBilling
          ? {
              billingId: activeBilling.id,
              createdAt: activeBilling.createdAt,
              totalOrders: activeBilling.orders.length,
            }
          : null,

        currentOrder: latestOrder
          ? {
              orderId: latestOrder.id,
              totalAmount: latestOrder.totalAmount,
              items: latestOrder.orderItems.map((oi) => ({
                menuItemId: oi.menuItemId,
                menuItemName: oi.menuItem.itemName,
                price: oi.menuItem.price,
                quantity: oi.quantity,
                subTotal: oi.subTotal,
              })),
            }
          : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching waiter tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

/* =====================================================
   🟥 CHECK IF WAITER CAN BE DELETED
===================================================== */
export const checkWaiterTables = async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);

    const assigned = await prisma.table.findMany({
      where: { waiterId },
    });

    if (assigned.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete waiter — ${assigned.length} tables assigned.`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error checking waiter tables:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   🟡 GET AVAILABLE TABLES (FOR HOST)
===================================================== */
export const getAvailableTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: { waiter: true },
    });

    // 🔥 Fix availability: if active billing exists → NOT available
    const fixed = tables.map((t) => ({
      ...t,
      available: t.billings?.some((b) => b.status === "Unbilled")
        ? false
        : t.available,
    }));

    res.json(fixed);
  } catch (err) {
    console.error("❌ Error fetching available tables:", err);
    res.status(500).json({ error: err.message });
  }
};
