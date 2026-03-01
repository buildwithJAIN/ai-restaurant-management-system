import express from "express";
import { createOrder, updateOrderStatus } from "../controllers/orderController.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/* ============================================================
   🟢 GET ALL ORDERS FOR WAITER
   /orders/waiter/:id
============================================================ */
router.get("/waiter/:id", async (req, res) => {
  try {
    const waiterId = parseInt(req.params.id);

    const orders = await prisma.order.findMany({
      where: { waiterId },
      include: {
        table: true,
        chef: { select: { id: true, firstName: true } },
        orderItems: { include: { menuItem: true } },
        billing: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ============================================================
   🟡 GET ALL ORDERS FOR A TABLE (FULL ORDER MODAL)
   /orders/table/:tableId
============================================================ */
router.get("/table/:tableId", async (req, res) => {
  try {
    const tableId = parseInt(req.params.tableId);

    const orders = await prisma.order.findMany({
      where: { tableId },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        billing: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching full order list:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ============================================================
   🔥 CREATE NEW ORDER
   Always creates a new row (never update existing)
   /orders   → POST
============================================================ */
router.post("/create", createOrder);

/* ============================================================
   🔄 UPDATE ORDER STATUS
   /orders/:id/status
============================================================ */
router.put("/:id/status", updateOrderStatus);


/* ============================================================
   🟣 GET ONLY READY ITEMS FOR WAITER
   /orders/waiter-ready/:waiterId
============================================================ */
router.get("/waiter-ready/:waiterId", async (req, res) => {
  try {
    const waiterId = parseInt(req.params.waiterId);

    const orders = await prisma.order.findMany({
      where: {
        waiterId,
        status: { in: ["InProgress", "Ready"] } 
      },
      include: {
        table: { select: { tableNumber: true } },
        orderItems: {
          where: { status: "Ready" },
          include: { menuItem: true },
        }
      },
      orderBy: { createdAt: "asc" }
    });

    // Remove orders with 0 ready items
    const filtered = orders.filter(o => o.orderItems.length > 0);

    res.json(filtered);

  } catch (err) {
    console.error("❌ Error fetching ready items:", err);
    res.status(500).json({ error: "Failed to fetch ready items" });
  }
});
/* ============================================================
   🟢 WAITER MARKS SELECTED ITEMS AS SERVED
   /orders/mark-items-served   → PATCH
============================================================ */
router.patch("/mark-items-served", async (req, res) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || items.length === 0) {
      return res.status(400).json({ error: "Order ID and items array required" });
    }

    // 1️⃣ Update selected items
    await prisma.orderItem.updateMany({
      where: { id: { in: items } },
      data: { status: "Served" }
    });

    // 2️⃣ Check if entire order is now served
    const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
    const allServed = orderItems.every(i => i.status === "Served");

    if (allServed) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "Completed" }
      });
    }

    res.json({
      success: true,
      servedCount: items.length,
      orderCompleted: allServed
    });

  } catch (err) {
    console.error("❌ Error serving items:", err);
    res.status(500).json({ error: "Failed to serve items" });
  }
});


export default router;
