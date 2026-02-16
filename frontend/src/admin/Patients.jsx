import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminShared.css'

const Patients = () => {
    const [patients, setPatients] = useState([])
    const [filteredPatients, setFilteredPatients] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const loadPatients = async () => {
        try {
            setLoading(true)
            const res = await api.get('accounts/admin/patients/')
            setPatients(res.data || [])
            setFilteredPatients(res.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPatients()
    }, [])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPatients(patients)
            return
        }
        const query = searchQuery.toLowerCase()
        setFilteredPatients(
            patients.filter((p) => (p.name || '').toLowerCase().includes(query))
        )
    }, [searchQuery, patients])

    const togglePatientStatus = async (patient) => {
        try {
            await api.patch(`accounts/admin/patients/${patient.id}/status/`, {
                is_active: !patient.is_active,
            })
            // Optimistic update or reload
            const updated = patients.map(p => p.id === patient.id ? { ...p, is_active: !p.is_active } : p)
            setPatients(updated)
        } catch (err) {
            console.error("Failed to toggle status", err)
        }
    }

    const deletePatient = async (patient) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete patient "${patient.name || patient.email}"?\n\nThis action cannot be undone and will remove all associated data.`
        )
        
        if (!confirmed) return

        try {
            await api.delete(`accounts/admin/patients/${patient.id}/delete/`)
            // Remove from list
            const updated = patients.filter(p => p.id !== patient.id)
            setPatients(updated)
        } catch (err) {
            console.error("Failed to delete patient", err)
            alert('Failed to delete patient. Please try again.')
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="admin-title">Patients</h2>
                    <p className="admin-subtitle">Manage registered patients</p>
                </div>
                <div className="admin-search-container">
                    <span className="admin-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search patients by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="admin-search-btn">Search</button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? `No patients found matching "${searchQuery}"` : 'No patients registered.'}
                </div>
            ) : (
                <div className="admin-grid">
                    {filteredPatients.map((patient) => (
                        <article className="admin-card" key={patient.id}>
                            <div className="admin-card-header">
                                <div>
                                    <h3 className="admin-card-title">{patient.name || 'Unknown Name'}</h3>
                                    <div className="admin-card-subtitle">{patient.email}</div>
                                </div>
                                <span className={`status-badge ${patient.is_active ? 'status-active' : 'status-blocked'}`}>
                                    {patient.is_active ? 'Active' : 'Blocked'}
                                </span>
                            </div>
                            <div className="admin-card-footer">
                                <button
                                    className={`btn-action ${patient.is_active ? 'btn-danger' : 'btn-success'}`}
                                    onClick={() => togglePatientStatus(patient)}
                                >
                                    {patient.is_active ? 'Block User' : 'Unblock User'}
                                </button>
                                <button
                                    className="btn-action btn-delete"
                                    onClick={() => deletePatient(patient)}
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

export default Patients
