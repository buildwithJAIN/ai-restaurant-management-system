import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const create = async (name) => {
  return await prisma.category.create({ data: { name } });
};

export const getAll = async () => {
  return await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
};

export const update = async (id, name) => {
  return await prisma.category.update({ where: { id }, data: { name } });
};

export const remove = async (id) => {
  return await prisma.category.delete({ where: { id } });
};
