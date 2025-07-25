import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesForm = () => {
  const [items, setItems] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: ''
  });
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

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

  const handleAddItem = () => {
    const item = items.find(i => i._id === selectedItem);
    if (item && quantity > 0 && quantity <= item.quantity) {
      setSaleItems([
        ...saleItems,
        {
          itemId: item._id,
          name: item.name,
          quantity: parseInt(quantity),
          price: item.price
        }
      ]);
      setSelectedItem('');
      setQuantity(1);
    }
  };

  const handleRemoveItem = (index) => {
    const newSaleItems = [...saleItems];
    newSaleItems.splice(index, 1);
    setSaleItems(newSaleItems);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saleItems.length === 0) return;

    try {
      await axios.post('http://localhost:5000/api/sales', {
        items: saleItems,
        totalAmount: calculateTotal(),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail
      });
      
      // Reset form
      setSaleItems([]);
      setFormData({
        customerName: '',
        customerEmail: ''
      });
      
      alert('Sale recorded successfully!');
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Error recording sale');
    }
  };

  return (
    <div className="sales-container">
      <h2>Sales Management</h2>
      
      <form onSubmit={handleSubmit} className="sale-form">
        <h3>Customer Information</h3>
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="customerEmail"
          placeholder="Customer Email (optional)"
          value={formData.customerEmail}
          onChange={handleInputChange}
        />
        
        <h3>Add Items to Sale</h3>
        <div className="add-item-section">
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            required
          >
            <option value="">Select an item</option>
            {items
              .filter(item => item.quantity > 0)
              .map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} - ${item.price} ({item.quantity} in stock)
                </option>
              ))
            }
          </select>
          <input
            type="number"
            min="1"
            max={selectedItem ? items.find(i => i._id === selectedItem)?.quantity : 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            disabled={!selectedItem}
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!selectedItem || quantity < 1}
            className="add-to-sale-btn"
          >
            Add to Sale
          </button>
        </div>
        
        <h3>Items in Sale</h3>
        {saleItems.length === 0 ? (
          <p>No items added to sale yet</p>
        ) : (
          <div className="sale-items-list">
            {saleItems.map((item, index) => (
              <div key={index} className="sale-item">
                <span>{item.name} - {item.quantity} @ ${item.price} = ${item.price * item.quantity}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="remove-item-btn"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="total-amount">
              <strong>Total: ${calculateTotal()}</strong>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={saleItems.length === 0}
          className="complete-sale-btn"
        >
          Complete Sale
        </button>
      </form>
    </div>
  );
};

export default SalesForm;