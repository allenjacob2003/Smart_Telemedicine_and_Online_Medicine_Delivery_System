const TrackOrder = () => {
  return (
    <div className="page">
      <h2>Track Order</h2>
      <div className="card">
        <p><strong>Order ID:</strong> ORD-12345</p>
        <ul className="status-list">
          <li className="done">Order Placed</li>
          <li className="done">Packed</li>
          <li className="active">Out for Delivery</li>
          <li>Delivered</li>
        </ul>
      </div>
    </div>
  )
}

export default TrackOrder
