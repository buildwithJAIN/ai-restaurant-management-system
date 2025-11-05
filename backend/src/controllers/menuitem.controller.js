import { menuItemService } from "../services/menuItem.service.js";

const parse = (req) => {
  const b = req.body || {};

  return {
    itemName: String(b.itemName ?? ""),
    category: String(b.category ?? "Main Course"),
    price: Number(b.price ?? 0),
    totalAvailable: Number(b.totalAvailable ?? 0),
    description: b.description ? String(b.description) : null,
    imageBase64: b.imageBase64 ? String(b.imageBase64) : null, // 👈 directly store base64
    available: Boolean(b.available ?? true),
  };
};

export const menuItemController = {
  async list(req, res) {
    try {
      const data = await menuItemService.list();
      res.json(data);
    } catch (error) {
      console.error("❌ Error fetching menu items:", error);
      res.status(500).json({ message: "Server error fetching menu items" });
    }
  },

  async get(req, res) {
    try {
      const id = Number(req.params.id);
      const item = await menuItemService.get(id);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("❌ Error fetching item:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async create(req, res) {
    try {
      const data = parse(req);
      if (!data.itemName || !data.category)
        return res
          .status(400)
          .json({ message: "Item name and category are required" });

      const created = await menuItemService.create(data);
      res.status(201).json(created);
    } catch (error) {
      console.error("❌ Error creating item:", error);
      res.status(500).json({ message: "Server error creating item" });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const exists = await menuItemService.get(id);
      if (!exists)
        return res.status(404).json({ message: "Item not found" });

      const data = parse(req);
      const updated = await menuItemService.update(id, data);
      res.json(updated);
    } catch (error) {
      console.error("❌ Error updating item:", error);
      res.status(500).json({ message: "Server error updating item" });
    }
  },

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      const exists = await menuItemService.get(id);
      if (!exists)
        return res.status(404).json({ message: "Item not found" });

      await menuItemService.remove(id);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error deleting item:", error);
      res.status(500).json({ message: "Server error deleting item" });
    }
  },
};
