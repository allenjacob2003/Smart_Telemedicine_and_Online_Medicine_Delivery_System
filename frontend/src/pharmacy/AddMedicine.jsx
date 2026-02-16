import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const AddMedicine = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    expiry_date: '',
  })
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)
    
    try {
      await api.post('pharmacy/add-medicine/', {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price || 0),
        available_quantity: Number(formData.stock_quantity || 0),
        low_stock_threshold: Number(formData.low_stock_threshold || 10),
        expiry_date: formData.expiry_date || null,
      })
      setMessage({ type: 'success', text: '✅ Medicine added successfully!' })
      setFormData({ name: '', category: '', price: '', stock_quantity: '', low_stock_threshold: '10', expiry_date: '' })
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to add medicine. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Antibiotics',
    'Pain Relief',
    'Vitamins & Supplements',
    'Cold & Flu',
    'Digestive Health',
    'Skin Care',
    'First Aid',
    'Chronic Conditions',
    'Other'
  ]

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>💊 Add New Medicine</h2>
          <p className="pharmacy-muted">Add a new medicine to your pharmacy inventory.</p>
        </div>
        <Link to="/pharmacy/stock" className="pharmacy-btn pharmacy-btn-secondary">
          📦 View Stock
        </Link>
      </section>

      {/* Alert Message */}
      {message && (
        <div className={`pharmacy-alert ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* Form Card */}
      <section className="pharmacy-card">
        <h3 className="pharmacy-card-title" style={{ marginBottom: '24px' }}>Medicine Details</h3>
        
        <form className="pharmacy-form" onSubmit={handleSubmit}>
          <div className="pharmacy-form-grid">
            <label>
              <span>Medicine Name <span style={{ color: 'var(--pharmacy-danger)' }}>*</span></span>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter medicine name"
                required 
              />
            </label>
            
            <label>
              <span>Category <span style={{ color: 'var(--pharmacy-danger)' }}>*</span></span>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="pharmacy-form-grid">
            <label>
              <span>Price (₹) <span style={{ color: 'var(--pharmacy-danger)' }}>*</span></span>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="0.00"
                min="0"
                step="0.01"
                required 
              />
            </label>
            
            <label>
              <span>Initial Stock Quantity <span style={{ color: 'var(--pharmacy-danger)' }}>*</span></span>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </label>
          </div>

          <div className="pharmacy-form-grid">
            <label>
              <span>Low Stock Alert Threshold</span>
              <input 
                type="number" 
                name="low_stock_threshold" 
                value={formData.low_stock_threshold} 
                onChange={handleChange} 
                placeholder="10"
                min="1"
              />
              <span className="pharmacy-form-hint">Alert when stock falls below this number</span>
            </label>
            
            <label>
              <span>Expiry Date</span>
              <input 
                type="date" 
                name="expiry_date" 
                value={formData.expiry_date} 
                onChange={handleChange} 
              />
            </label>
          </div>

          <div className="pharmacy-form-actions">
            <button 
              className="pharmacy-btn pharmacy-btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Adding...' : '➕ Add Medicine'}
            </button>
            <button 
              type="button" 
              className="pharmacy-btn pharmacy-btn-outline"
              onClick={() => setFormData({ name: '', category: '', price: '', stock_quantity: '', low_stock_threshold: '10', expiry_date: '' })}
            >
              🔄 Reset Form
            </button>
          </div>
        </form>
      </section>

      {/* Tips Card */}
      <section className="pharmacy-card">
        <h3 className="pharmacy-card-title" style={{ marginBottom: '16px' }}>💡 Tips</h3>
        <ul className="pharmacy-tips-list">
          <li>Always verify medicine details before adding to prevent duplicates</li>
          <li>Set appropriate low stock threshold to receive timely alerts</li>
          <li>Keep expiry dates updated to manage stock rotation</li>
          <li>Use consistent category names for better organization</li>
        </ul>
      </section>
    </PharmacyLayout>
  )
}

export default AddMedicine
