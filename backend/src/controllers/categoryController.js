import * as categoryService from '../services/categoryService.js';

export const getAll = async (req, res) => {
  try {
    const data = await categoryService.getAll();
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);   // 👈 keep this
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const category = await categoryService.create(name);
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('❌ Error creating category:', error);      // 👈 keep this
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};


export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const updated = await categoryService.update(id, name);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await categoryService.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};
