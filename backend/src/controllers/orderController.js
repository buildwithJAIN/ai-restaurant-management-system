import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =====================================================
   ✅ CREATE ORDER (WITH BILLING HANDLING)
===================================================== */
export const createOrder = async (req, res) => {
  try {
    const { waiterId, tableId, items } = req.body;

    if (!waiterId || !tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Calculate total
    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // 2️⃣ Check if there is an active BILLING
    let billing = await prisma.billing.findFirst({
      where: { tableId, status: "Unbilled" }
    });

    // 3️⃣ If NOT → create a fresh billing record
    if (!billing) {
      billing = await prisma.billing.create({
        data: {
          tableId,
          status: "Unbilled"
        }
      });
    }

    // 4️⃣ Create ORDER under this billing
    const order = await prisma.order.create({
      data: {
        waiterId,
        tableId,
        billingId: billing.id, // 🔥 billing attached here
        totalAmount,
        status: "Pending",
      },
    });

    // 5️⃣ Insert items + reduce stock
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          subTotal: item.price * item.quantity,
        },
      });

      await prisma.menuItem.update({
        where: { id: item.menuItemId },
        data: {
          totalAvailable: { decrement: item.quantity },
        },
      });
    }

    // 6️⃣ Change table status → Occupied
    await prisma.table.update({
      where: { id: tableId },
      data: { status: "Occupied" },
    });

    res.status(201).json({
      success: true,
      billingId: billing.id,
      order
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

/* =====================================================
   🔄 UPDATE ORDER STATUS
===================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid or missing order ID" });
    }

    if (!status) {
      return res.status(400).json({ error: "Missing status field" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ error: "Error updating order" });
  }
};

/* =====================================================
   ➕ ADD ITEMS TO EXISTING ORDER
===================================================== */
export const addItemsToOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { items } = req.body;

    if (!orderId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert new items + reduce stock
    for (const it of items) {
      await prisma.orderItem.create({
        data: {
          orderId,
          menuItemId: it.menuItemId,
          quantity: it.quantity,
          price: it.price,
          subTotal: it.quantity * it.price,
        },
      });

      await prisma.menuItem.update({
        where: { id: it.menuItemId },
        data: {
          totalAvailable: { decrement: it.quantity },
        },
      });
    }

    // Recalculate total
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    const totalAmount = order.orderItems.reduce(
      (sum, i) => sum + i.subTotal,
      0
    );

    await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount },
    });

    res.json({ success: true, message: "Items added to order" });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};
