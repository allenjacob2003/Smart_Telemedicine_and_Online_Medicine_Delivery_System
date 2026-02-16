import { useEffect, useState } from 'react'
import api from '../api/axios'
import PatientLayout from '../dashboard/PatientLayout.jsx'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('patients/my-orders/', { params: { email } })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setOrders(data)
      } catch (err) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>My Orders</h2>
          <p className="patient-muted">Track your medicine delivery status.</p>
        </div>
      </section>

      <section className="patient-card">
        {loading ? (
          <div className="patient-empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="patient-empty">No orders found.</div>
        ) : (
          <div className="patient-table-wrapper">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Order Date</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.medicine_name || order.medicineName}</td>
                    <td>{order.quantity}</td>
                    <td>{order.order_date || order.orderDate}</td>
                    <td>{order.delivery_status || order.deliveryStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PatientLayout>
  )
}

export default MyOrders
