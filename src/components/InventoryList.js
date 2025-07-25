import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    supplier: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/items', formData);
      setFormData({
        name: '',
        quantity: '',
        price: '',
        category: '',
        supplier: ''
      });
      setShowForm(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      <button onClick={() => setShowForm(!showForm)} className="add-item-btn">
        {showForm ? 'Cancel' : 'Add New Item'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="item-form">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="supplier"
            placeholder="Supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Add Item</button>
        </form>
      )}

      <div className="items-grid">
        {items.map((item) => (
          <div key={item._id} className="item-card">
            <h3>{item.name}</h3>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Supplier:</strong> {item.supplier}</p>
            <button onClick={() => handleDelete(item._id)} className="delete-btn">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;