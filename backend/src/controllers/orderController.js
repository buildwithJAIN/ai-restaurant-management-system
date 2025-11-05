import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create new order and update stock
export const createOrder = async (req, res) => {
  try {
    const { waiterId, tableId, items } = req.body;

    if (!waiterId || !tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        waiterId,
        tableId,
        totalAmount,
        status: "Pending",
      },
    });

    // Insert items + reduce stock
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

      // Reduce stock
      await prisma.menuItem.update({
        where: { id: item.menuItemId },
        data: {
          totalAvailable: { decrement: item.quantity },
        },
      });
    }

    // Make the table unavailable
    await prisma.table.update({
      where: { id: tableId },
      data: { available: false },
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};
