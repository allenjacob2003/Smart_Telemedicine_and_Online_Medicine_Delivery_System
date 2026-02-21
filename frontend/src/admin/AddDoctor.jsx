import { useState } from 'react'
import api from '../api/axios'

const AddDoctor = ({ departments }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        phone: '',
        department: '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [warning, setWarning] = useState('')

    const [loading, setLoading] = useState(false)

    const safeDepartments = Array.isArray(departments) ? departments : []

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setWarning('')
        setLoading(true)

        try {
            const res = await api.post('accounts/create-doctor/', form)
            
            // Check for email status in response
            const emailSent = res?.data?.email_sent === true
            const emailError = res?.data?.email_error

            if (!emailSent) {
                const reason = typeof emailError === 'string' && emailError.trim() ? ` Reason: ${emailError}` : ''
                setWarning(`Doctor added successfully, but email notification could not be sent.${reason}`)
                setSuccess('')
                // Keep the detailed reason only in console; avoid exposing server details to users.
                if (emailError) console.warn('Doctor welcome email failed:', emailError)
            } else {
                setSuccess('Doctor added successfully. Email sent to doctor.!!')
            
            }

            setForm({ name: '', email: '', password: '', specialization: '', phone: '', department: '' })
        } catch (err) {
            const message = err?.response?.data?.detail || 'Failed to create doctor'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-card admin-card-wide">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Add New Doctor</h3>
                </div>
                <div className="admin-card-body">
                    <form className="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                            <input
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                            <input
                                type="email"
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                            <input
                                type="password"
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Specialization</label>
                            <input
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.specialization}
                                onChange={(e) => handleChange('specialization', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone</label>
                            <input
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Department</label>
                            <select
                                className="admin-search-input"
                                style={{ width: '100%', border: '2px solid var(--admin-border)', borderRadius: 'var(--radius-md)' }}
                                value={form.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                required
                            >
                                <option value="">Select Department</option>
                                {safeDepartments.map((d) => (
                                    <option key={d.id} value={d.name}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && <p className="error" style={{ color: 'var(--admin-accent-rose)', marginTop: '0.5rem' }}>{error}</p>}
                        {success && <p className="note" style={{ color: 'var(--admin-accent-emerald)', marginTop: '0.5rem' }}>{success}</p>}
                        {warning && <p className="warning" style={{ color: 'var(--admin-accent-amber)', marginTop: '0.5rem' }}>{warning}</p>}

                        <button
                            type="submit"
                            className="admin-search-btn"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Doctor'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddDoctor
