import React from 'react';
import './App.css';
import InventoryList from './components/InventoryList';
import SalesForm from './components/SalesForm';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Inventory Management System</h1>
        <p>Track your inventory and manage sales efficiently</p>
      </header>
      
      <div className="container">
        <InventoryList />
        <SalesForm />
      </div>
    </div>
  );
}

export default App;
