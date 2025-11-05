import { PrismaClient } from "@prisma/client";
const prims = new PrismaClient()

// ✅ Create order
export const createOrder = async ({ waiterId, tableId, items, total }) => {
  // 1️⃣ Create order record
  const order = await prisma.order.create({
    data: {
      waiterId,
      tableId,
      totalAmount: total,
      status: 'Pending',
      orderItems: {
        create: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.qty,
          price: i.price,
          subTotal: i.qty * i.price,
        })),
      },
    },
    include: { orderItems: true, table: true },
  });

  // 2️⃣ Reduce stock for each ordered menu item
  for (const i of items) {
    await prisma.menuItem.update({
      where: { id: i.id },
      data: { totalAvailable: { decrement: i.qty } },
    });
  }

  // 3️⃣ Update table status to Occupied
  await prisma.table.update({
    where: { id: tableId },
    data: { status: 'Occupied' },
  });

  return order;
};

// ✅ Fetch orders by waiter
export const getOrdersByWaiter = async (waiterId) => {
  return await prisma.order.findMany({
    where: { waiterId },
    include: {
      table: true,
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ✅ Fetch orders by table
export const getOrdersByTable = async (tableId) => {
  return await prisma.order.findMany({
    where: { tableId },
    include: {
      waiter: true,
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
