const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventorydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now }
});

const saleSchema = new mongoose.Schema({
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  saleDate: { type: Date, default: Date.now }
});

// Models
const Item = mongoose.model('Item', itemSchema);
const Sale = mongoose.model('Sale', saleSchema);

// API Endpoints
// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new item
app.post('/api/items', async (req, res) => {
  const item = new Item({
    name: req.body.name,
    quantity: req.body.quantity,
    price: req.body.price,
    category: req.body.category,
    supplier: req.body.supplier
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item
app.patch('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    Object.assign(item, req.body);
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().populate('items.itemId');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sale
app.post('/api/sales', async (req, res) => {
  const sale = new Sale({
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail
  });

  try {
    const newSale = await sale.save();
    // Update inventory quantities
    for (const item of req.body.items) {
      await Item.findByIdAndUpdate(item.itemId, {
        $inc: { quantity: -item.quantity }
      });
    }
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;