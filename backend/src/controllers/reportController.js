import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ==========================================================
    1️⃣ DAILY SUMMARY REPORT
========================================================== */
export const getSummaryReport = async (req, res) => {
  try {
    // Fetch billed bills + orders
    const bills = await prisma.billing.findMany({
      where: { status: "Billed" },
      include: { orders: true }
    });

    const totalRevenue = bills.reduce((sum, bill) => {
      const billTotal = bill.orders.reduce(
        (inner, o) => inner + o.totalAmount,
        0
      );
      return sum + billTotal;
    }, 0);

    const activeBills = await prisma.billing.count({
      where: { status: "Unbilled" }
    });

    const closedBills = await prisma.billing.count({
      where: { status: "Billed" }
    });

    const completedOrders = await prisma.order.count({
      where: { status: { in: ["Served", "Paid"] } }
    });

    const itemsSold = await prisma.orderItem.aggregate({
      _sum: { quantity: true }
    });

    // Customer count = all occupied tables
    const occupiedTables = await prisma.table.findMany({
      where: { status: "Occupied" },
      select: { capacity: true }
    });

    const customerCount = occupiedTables.reduce(
      (sum, t) => sum + t.capacity,
      0
    );

    res.json({
      totalRevenue,
      activeBills,
      closedBills,
      totalOrders: completedOrders,
      totalItemsSold: itemsSold._sum.quantity || 0,
      customerCount
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to load summary report" });
  }
};





/* ==========================================================
    2️⃣ SALES REPORT
========================================================== */
export const getSalesReport = async (req, res) => {
  try {
    const usage = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true, subTotal: true }
    });

    const menuItems = await prisma.menuItem.findMany({
      select: { id: true, itemName: true }
    });

    const nameMap = {};
    menuItems.forEach(m => (nameMap[m.id] = m.itemName));

    const itemSales = usage.map(u => ({
      itemId: u.menuItemId,
      name: nameMap[u.menuItemId] || "Unknown",
      quantitySold: u._sum.quantity || 0,
      revenue: u._sum.subTotal || 0
    }));

    const orders = await prisma.order.findMany({
      select: { createdAt: true, totalAmount: true }
    });

    const hourlyBucket = {};

    orders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      const label = `${hour}:00`;

      if (!hourlyBucket[label])
        hourlyBucket[label] = { orders: 0, revenue: 0 };

      hourlyBucket[label].orders++;
      hourlyBucket[label].revenue += o.totalAmount;
    });

    const hourlyStats = Object.entries(hourlyBucket).map(([label, vals]) => ({
      label,
      orders: vals.orders,
      revenue: vals.revenue
    }));

    const topItem =
      itemSales.length > 0
        ? itemSales.reduce((a, b) =>
            a.quantitySold > b.quantitySold ? a : b
          )
        : null;

    res.json({ itemSales, topItem, hourlyStats });
  } catch (err) {
    console.error("SALES ERROR:", err);
    res.status(500).json({ error: "Failed to load sales report" });
  }
};





/* ==========================================================
    3️⃣ STAFF REPORT
========================================================== */
export const getStaffReport = async (req, res) => {
  try {
    // WAITERS
    const waiters = await prisma.user.findMany({
      where: { role: "Waiter" },
      select: { id: true, firstName: true, lastName: true }
    });

    const waiterStats = await Promise.all(
      waiters.map(async w => {
        const ordersTaken = await prisma.order.count({
          where: { waiterId: w.id }
        });

        const ordersServed = await prisma.order.count({
          where: { waiterId: w.id, status: "Served" }
        });

        const totalRevenue = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { waiterId: w.id }
        });

        return {
          waiterId: w.id,
          name: `${w.firstName} ${w.lastName}`,
          ordersTaken,
          ordersServed,
          revenue: totalRevenue._sum.totalAmount || 0
        };
      })
    );

    // CHEFS
    const chefs = await prisma.user.findMany({
      where: { role: "Chef" },
      select: { id: true, firstName: true, lastName: true }
    });

    const chefStats = await Promise.all(
      chefs.map(async c => {
        const ordersPrepared = await prisma.order.count({
          where: { chefId: c.id }
        });

        const itemsCooked = await prisma.orderItem.count({
          where: { order: { chefId: c.id } }
        });

        return {
          chefId: c.id,
          name: `${c.firstName} ${c.lastName}`,
          ordersPrepared,
          itemsCooked
        };
      })
    );

    res.json({ waiters: waiterStats, chefs: chefStats });
  } catch (err) {
    console.error("STAFF ERROR:", err);
    res.status(500).json({ error: "Failed to load staff report" });
  }
};




/* ==========================================================
    4️⃣ HISTORY REPORT (Billing + Inventory)
========================================================== */
export const getHistoryReport = async (req, res) => {
  try {
    const { range } = req.query;

    let startDate = new Date();
    if (range === "today") startDate.setHours(0, 0, 0, 0);
    else if (range === "week") startDate.setDate(startDate.getDate() - 7);
    else if (range === "month") startDate.setMonth(startDate.getMonth() - 1);

    const billing = await prisma.billing.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        table: {
          include: {
            waiter: { select: { firstName: true, lastName: true } }
          }
        },
        orders: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedBilling = billing.map(b => ({
      billingId: b.id,
      tableNumber: b.table.tableNumber,
      waiterName: b.table.waiter
        ? `${b.table.waiter.firstName} ${b.table.waiter.lastName}`
        : "-",
      totalAmount: b.orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      ),
      createdAt: b.createdAt
    }));

    const usage = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true },
      where: {
        order: { createdAt: { gte: startDate } }
      }
    });

    const menu = await prisma.menuItem.findMany({
      select: { id: true, itemName: true, totalAvailable: true }
    });

    const inventory = usage.map(u => {
      const item = menu.find(m => m.id === u.menuItemId);
      return {
        itemId: u.menuItemId,
        name: item?.itemName || "Unknown",
        usedQty: u._sum.quantity || 0,
        remainingStock: item?.totalAvailable || 0
      };
    });

    res.json({ billing: formattedBilling, inventory });
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to load history report" });
  }
};


