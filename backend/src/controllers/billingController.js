import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =====================================================
   🟢 1. GET ACTIVE BILLING FOR A TABLE
===================================================== */
export const getActiveBilling = async (req, res) => {
  try {
    const tableId = parseInt(req.params.tableId);

    const billing = await prisma.billing.findFirst({
      where: { tableId, status: "Unbilled" },
      include: {
        orders: {
          orderBy: { createdAt: "asc" },
          include: {
            orderItems: {
              include: {
                menuItem: { select: { itemName: true, price: true } },
              },
            },
          },
        },
      },
    });

    res.json(billing || null);
  } catch (err) {
    console.error("❌ Error fetching active billing:", err);
    res.status(500).json({ error: "Failed to fetch active billing" });
  }
};

/* =====================================================
   🟢 1B. GET ALL ACTIVE BILLINGS (Manager / Host)
===================================================== */
export const getAllActiveBillings = async (req, res) => {
  try {
    const activeBills = await prisma.billing.findMany({
      where: { status: "Unbilled" },
      orderBy: { createdAt: "asc" },
      include: {
        table: true,
        orders: {
          orderBy: { createdAt: "asc" },
          include: {
            orderItems: {
              include: {
                menuItem: { select: { itemName: true, price: true } },
              },
            },
          },
        },
      },
    });

    const formatted = activeBills.map((bill) => ({
      ...bill,
      canBill: bill.orders.every((o) => o.status === "Served"),
      totalAmount: bill.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching all active billings:", err);
    res.status(500).json({ error: "Failed to load active billings" });
  }
};

/* =====================================================
   🟢 1C. GET ACTIVE BILLINGS BY WAITER (Waiter View)
===================================================== */
export const getActiveBillingsByWaiter = async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);

    const billings = await prisma.billing.findMany({
      where: {
        status: "Unbilled",
        table: {
          waiterId: waiterId    // 🔥 Correct relational filter
        }
      },
      include: {
        table: true,
        orders: {
          orderBy: { createdAt: "asc" },
          include: {
            orderItems: {
              include: {
                menuItem: { select: { itemName: true, price: true } },
              },
            },
          },
        },
      },
    });

    const formatted = billings.map((bill) => ({
      ...bill,
      canBill: bill.orders.every((o) => o.status === "Served"),
      totalAmount: bill.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching waiter billings:", err);
    res.status(500).json({ error: "Failed to fetch waiter billings" });
  }
};

/* =====================================================
   🟡 2. GET BILLING SUMMARY (Final Bill Screen)
===================================================== */
export const getBillingSummary = async (req, res) => {
  try {
    const billingId = parseInt(req.params.billingId);

    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
      include: {
        table: true,
        orders: {
          orderBy: { createdAt: "asc" },
          include: {
            orderItems: {
              include: {
                menuItem: { select: { itemName: true, price: true } },
              },
            },
          },
        },
      },
    });

    if (!billing) {
      return res.status(404).json({ error: "Billing not found" });
    }

    const grandTotal = billing.orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({
      billingId,
      tableNumber: billing.table.tableNumber,
      status: billing.status,
      createdAt: billing.createdAt,
      closedAt: billing.closedAt,
      grandTotal,
      orders: billing.orders,
    });
  } catch (err) {
    console.error("❌ Error fetching billing summary:", err);
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
};

/* =====================================================
   🔥 3. CLOSE BILLING (FREE TABLE)
===================================================== */
export const closeBilling = async (req, res) => {
  try {
    const billingId = parseInt(req.params.billingId);

    const billing = await prisma.billing.update({
      where: { id: billingId },
      data: {
        status: "Billed",
        closedAt: new Date(),
      },
      include: { table: true },
    });

    await prisma.table.update({
      where: { id: billing.tableId },
      data: { status: "Available" },
    });

    res.json({
      success: true,
      message: "Billing completed and table is now free.",
    });
  } catch (err) {
    console.error("❌ Error closing billing:", err);
    res.status(500).json({ error: "Failed to close billing" });
  }
};
