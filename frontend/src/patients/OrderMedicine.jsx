import { useState } from 'react'

const OrderMedicine = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Paracetamol 500mg', qty: 1, price: 20 },
    { id: 2, name: 'Vitamin C', qty: 1, price: 50 },
  ])

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0)

  return (
    <div className="page">
      <h2>Order Medicines</h2>
      <div className="card">
        {items.map((item) => (
          <div key={item.id} className="row">
            <span>{item.name}</span>
            <input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => updateQty(item.id, Number(e.target.value))}
            />
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
        <hr />
        <p><strong>Total:</strong> ₹{total}</p>
        <button className="btn">Place Order</button>
      </div>
    </div>
  )
}

export default OrderMedicine
