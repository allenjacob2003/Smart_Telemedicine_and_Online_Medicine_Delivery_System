import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminShared.css'

const Doctors = () => {
    const [doctors, setDoctors] = useState([])
    const [filteredDoctors, setFilteredDoctors] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const loadDoctors = async () => {
        try {
            setLoading(true)
            const res = await api.get('accounts/admin/doctors/')
            setDoctors(res.data || [])
            setFilteredDoctors(res.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDoctors()
    }, [])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredDoctors(doctors)
            return
        }
        const query = searchQuery.toLowerCase()
        setFilteredDoctors(
            doctors.filter(
                (d) =>
                    (d.name || '').toLowerCase().includes(query) ||
                    (d.department || '').toLowerCase().includes(query)
            )
        )
    }, [searchQuery, doctors])

    const toggleDoctorStatus = async (doctor) => {
        try {
            await api.patch(`accounts/admin/doctors/${doctor.id}/status/`, {
                is_active: !doctor.is_active,
            })
            const updated = doctors.map(d => d.id === doctor.id ? { ...d, is_active: !d.is_active } : d)
            setDoctors(updated)
        } catch (err) {
            console.error("Failed to toggle status", err)
        }
    }

    const deleteDoctor = async (doctor) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete Dr. ${doctor.name}?\n\nThis action cannot be undone and will remove all associated data including appointments and consultation requests.`
        )
        
        if (!confirmed) return

        try {
            await api.delete(`accounts/admin/doctors/${doctor.id}/delete/`)
            // Remove from list
            const updated = doctors.filter(d => d.id !== doctor.id)
            setDoctors(updated)
        } catch (err) {
            console.error("Failed to delete doctor", err)
            alert('Failed to delete doctor. Please try again.')
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="admin-title">Doctors</h2>
                    <p className="admin-subtitle">Manage medical staff</p>
                </div>
                <div className="admin-search-container">
                    <span className="admin-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search by Name or Department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="admin-search-btn">Search</button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? `No doctors found matching "${searchQuery}"` : 'No doctors registered.'}
                </div>
            ) : (
                <div className="admin-grid">
                    {filteredDoctors.map((doc) => (
                        <article className="admin-card" key={doc.id}>
                            <div className="admin-card-header">
                                <div>
                                    <h3 className="admin-card-title">{doc.name}</h3>
                                    <div className="admin-card-subtitle">{doc.email}</div>
                                </div>
                                <span className={`status-badge ${doc.is_active ? 'status-active' : 'status-blocked'}`}>
                                    {doc.is_active ? 'Active' : 'Blocked'}
                                </span>
                            </div>
                            <div className="admin-card-body">
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Department</span>
                                    <span className="admin-card-value">{doc.department || 'General'}</span>
                                </div>
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Phone</span>
                                    <span className="admin-card-value">{doc.phone || '—'}</span>
                                </div>
                            </div>
                            <div className="admin-card-footer">
                                <button
                                    className={`btn-action ${doc.is_active ? 'btn-danger' : 'btn-success'}`}
                                    onClick={() => toggleDoctorStatus(doc)}
                                >
                                    {doc.is_active ? 'Block Access' : 'Unblock Access'}
                                </button>
                                <button
                                    className="btn-action btn-delete"
                                    onClick={() => deleteDoctor(doc)}
                                    style={{
                                        background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                        color: 'white',
                                        marginLeft: '8px'
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Doctors
