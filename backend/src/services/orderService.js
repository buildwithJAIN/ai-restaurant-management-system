import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create order
export const createOrder = async ({ waiterId, tableId, items, total }) => {
  const order = await prisma.order.create({
    data: {
      waiterId,
      tableId,
      totalAmount: total,
      status: "Pending",
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

  for (const i of items) {
    await prisma.menuItem.update({
      where: { id: i.id },
      data: { totalAvailable: { decrement: i.qty } },
    });
  }

  await prisma.table.update({
    where: { id: tableId },
    data: { available: true },
  });

  return order;
};

// ✅ Fetch orders by waiter
export const getOrdersByWaiter = async (waiterId) => {
  return await prisma.order.findMany({
    where: { waiterId },
    include: {
      table: true,
      chef: { select: { firstName: true, lastName: true } },
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ✅ Fetch in-progress orders by chef
export const getInProgressOrdersByChef = async (chefId) => {
  return await prisma.order.findMany({
    where: { chefId, status: "InProgress" },
    include: {
      table: true,
      waiter: { select: { firstName: true, lastName: true } },
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ✅ Start cooking (assign to chef)
export const startCookingOrder = async (orderId, chefId) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { chefId, status: "InProgress" },
  });
};

// ✅ Mark order ready
export const markOrderAsReady = async (orderId) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: "Ready" },
  });
};

// ✅ Mark order served
export const markOrderAsServed = async (orderId) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: "Served" },
  });
};

// ✅ Fetch completed orders
export const getCompletedOrders = async () => {
  return await prisma.order.findMany({
    where: { status: "Served" },
    include: {
      table: true,
      waiter: { select: { firstName: true, lastName: true } },
      chef: { select: { firstName: true, lastName: true } },
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
