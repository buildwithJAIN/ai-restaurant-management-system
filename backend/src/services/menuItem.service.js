import prisma from "../config/db.js";

export const menuItemService = {
  async list() {
    return prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } });
  },

  async get(id) {
    return prisma.menuItem.findUnique({ where: { id } });
  },

  async create(data) {
    return prisma.menuItem.create({ data });
  },

  async update(id, data) {
    return prisma.menuItem.update({ where: { id }, data });
  },

  async remove(id) {
    return prisma.menuItem.delete({ where: { id } });
  },
};
