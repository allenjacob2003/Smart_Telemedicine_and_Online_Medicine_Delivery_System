import { useEffect, useMemo, useState, useCallback } from 'react'
import api from '../api/axios'
import PatientLayout from '../dashboard/PatientLayout.jsx'

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const OrderMedicines = () => {
  const [stock, setStock] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('pharmacy/stock/')
      setStock(response.data || [])
    } catch (err) {
      setStock([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id)
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        )
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const handleQuantityChange = (id, quantity) => {
    const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: safeQty } : item)))
  }

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const filteredStock = useMemo(() => {
    if (!searchQuery.trim()) return stock
    const query = searchQuery.toLowerCase()
    return stock.filter((item) => 
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }, [stock, searchQuery])

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || paymentLoading) return
    setMessage('')
    setPaymentLoading(true)

    try {
      const email = localStorage.getItem('email')
      if (!email) {
        setMessage('Please log in to continue.')
        setPaymentLoading(false)
        return
      }

      const items = cart.map((item) => ({
        medicine_id: item.id,
        quantity: item.quantity,
      }))

      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      const sdkLoaded = await loadRazorpay()
      if (!sdkLoaded) {
        setMessage('Razorpay SDK failed to load.')
        setPaymentLoading(false)
        return
      }

      const orderResponse = await api.post('payments/create-order/', {
        payment_type: 'pharmacy',
        amount: Number(totalAmount.toFixed(2)),
        email,
        items,
      })

      const { order_id, key, amount } = orderResponse.data

      const options = {
        key,
        order_id,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        name: 'Telemedicine Pharmacy',
        description: 'Medicine order payment',
        prefill: { email },
        handler: async (response) => {
          try {
            await api.post('payments/verify-payment/', {
              payment_type: 'pharmacy',
              amount,
              email,
              items,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            })
            setMessage('Payment successful. Order placed.')
            setCart([])
            fetchStock()
          } catch (err) {
            setMessage(err?.response?.data?.detail || 'Payment verification failed.')
          } finally {
            setPaymentLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
            setMessage('Payment cancelled.')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Payment initialization failed.')
      setPaymentLoading(false)
    }
  }

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>Order Medicines</h2>
          <p className="patient-muted">Browse available medicines and place an order.</p>
        </div>
      </section>

      <section className="patient-card">
        <div className="patient-form">
          <label>
            Search Medicines
            <input
              type="text"
              placeholder="Search by medicine name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="patient-grid">
        {loading ? (
          <div className="patient-empty">Loading medicines...</div>
        ) : stock.length === 0 ? (
          <div className="patient-empty">No medicines available.</div>
        ) : filteredStock.length === 0 ? (
          <div className="patient-empty">No medicines found matching "{searchQuery}".</div>
        ) : (
          filteredStock.map((item) => (
            <article className="patient-card" key={item.id}>
              <h3 className="patient-card-title">{item.name}</h3>
              <p className="patient-muted">Available: {item.available_quantity}</p>
              <p className="patient-muted">Price: ₹ {item.price}</p>
              <button className="patient-btn patient-btn-primary" type="button" onClick={() => handleAddToCart(item)}>
                Add to Cart
              </button>
            </article>
          ))
        )}
      </section>

      <section className="patient-card">
        <h3 className="patient-card-title">My Cart</h3>
        {cart.length === 0 ? (
          <div className="patient-empty">No items added.</div>
        ) : (
          <div className="patient-table-wrapper">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                      />
                    </td>
                    <td>₹ {item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="patient-actions">
          <span className="patient-card-title">Total: ₹ {total.toFixed(2)}</span>
          <button
            className="patient-btn patient-btn-primary"
            type="button"
            disabled={cart.length === 0 || paymentLoading}
            onClick={handlePlaceOrder}
          >
            {paymentLoading ? 'Processing...' : 'Pay & Place Order'}
          </button>
        </div>
        {message && <div className="patient-empty">{message}</div>}
      </section>
    </PatientLayout>
  )
}

export default OrderMedicines
