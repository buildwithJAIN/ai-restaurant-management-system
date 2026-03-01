// backend/src/controllers/chefController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * GET /api/chef/orders/pending
 * All unassigned, pending orders
 */
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "Pending", chefId: null },
      orderBy: { createdAt: "asc" },
      include: {
        table: true,
        waiter: { select: { firstName: true, lastName: true } },
        orderItems: {
          include: {
            menuItem: { select: { itemName: true,imageUrl:true } }
          }
        }
      }
    });
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load pending orders" });
  }
};

/**
 * PATCH /api/chef/orders/start/:orderId
 * Assign current chef & mark InProgress (race-safe)
 */
export const startCooking = async (req, res) => {
  try {
    const { orderId } = req.params;
    // If you have auth, take from token: const chefId = req.user.id;
    // For now accept from header or body fallback:
    const chefId = Number(req.headers["x-chef-id"] ?? req.body.chefId);

    if (!chefId) {
      return res.status(400).json({ success: false, message: "chefId required" });
    }

    // Atomic guard: only if still Pending and unassigned
    const result = await prisma.order.updateMany({
      where: { id: Number(orderId), status: "Pending", chefId: null },
      data: { status: "InProgress", chefId }
    });

    if (result.count === 0) {
      return res.status(409).json({
        success: false,
        message: "This order has already been taken by another chef."
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        table: true,
        waiter: { select: { firstName: true, lastName: true } },
        orderItems: { include: { menuItem: { select: { itemName: true } } } }
      }
    });

    res.json({ success: true, order: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to start order" });
  }
};

/**
 * GET /api/chef/orders/in-progress
 * Orders currently assigned to this chef
 */

// Get in-progress orders for a particular chef
export const getChefInProgressOrders = async (req, res) => {
  try {
  const chefId = parseInt(req.params.chefId);

  const orders = await prisma.order.findMany({
    where: {
      status: "InProgress",
      chefId: chefId,
    },
    include: {
      table: { select: { tableNumber: true } },
      waiter: { select: { firstName: true, lastName: true } },
      orderItems: {
        where: { status: "InProgress" }, // ⭐ ONLY items still being prepared
        include: {
          menuItem: {
            select: {
              itemName: true,
              imageUrl: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // ⭐ Remove orders that now have 0 items in progress
  const activeOrders = orders.filter(o => o.orderItems.length > 0);

  res.json(activeOrders);

} catch (err) {
  console.error("❌ Error fetching in-progress orders:", err);
  res.status(500).json({ error: "Failed to fetch orders" });
}

};

export const markItemsReady = async (req, res) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || items.length === 0) {
      return res.status(400).json({ error: "Order ID and items array required" });
    }

    // 1️⃣ Update selected items
    await prisma.orderItem.updateMany({
      where: {
        id: { in: items }
      },
      data: {
        status: "Ready"
      }
    });

    // 2️⃣ Check if all items for this order are ready
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    });

    const allReady = orderItems.every(i => i.status === "Ready");

    // 3️⃣ If all ready → update order status
    if (allReady) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "Ready" }
      });
    }

    res.json({
      success: true,
      updatedItems: items.length,
      orderCompleted: allReady
    });

  } catch (err) {
    console.error("❌ markItemsReady Error:", err);
    res.status(500).json({ error: "Failed to update item status" });
  }
};





// export const getInProgressOrders = async (req, res) => {
//   try {
//     const chefId = Number(req.headers["x-chef-id"] ?? req.query.chefId);
//     const orders = await prisma.order.findMany({
//       where: { status: "InProgress", chefId },
//       orderBy: { createdAt: "asc" },
//       include: {
//         table: true,
//         waiter: { select: { firstName: true, lastName: true } },
//         orderItems: { include: { menuItem: { select: { itemName: true } } } }
//       }
//     });
//     res.json(orders);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Failed to load in-progress orders" });
//   }
// };

/**
 * PATCH /api/chef/orders/ready/:orderId
 * Mark order as Ready (waiter can see under 'Ready')
 */
export const markReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: "Ready" },
    });

    res.json({ message: "✅ Order marked as Ready", order });
  } catch (error) {
    console.error("❌ Error marking order ready:", error);
    res.status(500).json({ error: "Failed to mark ready" });
  }
};

// ✅ Fetch all completed (Ready) orders
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ["Ready", "Served", "Billed","Unbilled"] } },
      include: {
        table: { select: { tableNumber: true } },
        waiter: { select: { firstName: true, lastName: true } },
        orderItems: {
          include: { menuItem: { select: { itemName: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching completed orders:", error);
    res.status(500).json({ error: "Failed to fetch completed orders" });
  }
};
