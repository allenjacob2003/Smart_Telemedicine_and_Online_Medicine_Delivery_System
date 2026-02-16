import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminShared.css'

const Departments = () => {
    const [departments, setDepartments] = useState([])
    const [filteredDepartments, setFilteredDepartments] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const loadDepartments = async () => {
        try {
            setLoading(true)
            const res = await api.get('doctors/departments/')
            setDepartments(res.data || [])
            setFilteredDepartments(res.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDepartments()
    }, [])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredDepartments(departments)
            return
        }
        const query = searchQuery.toLowerCase()
        setFilteredDepartments(
            departments.filter((d) => (d.name || '').toLowerCase().includes(query))
        )
    }, [searchQuery, departments])

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="admin-title">Departments</h2>
                    <p className="admin-subtitle">Medical departments and specializations</p>
                </div>
                <div className="admin-search-container">
                    <span className="admin-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="admin-search-btn">Search</button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Loading departments...</div>
            ) : filteredDepartments.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? `No departments found matching "${searchQuery}"` : 'No departments available.'}
                </div>
            ) : (
                <div className="admin-grid">
                    {filteredDepartments.map((dept) => (
                        <article className="admin-card" key={dept.id || dept.name}>
                            <div className="admin-card-header">
                                <div>
                                    <h3 className="admin-card-title">{dept.name}</h3>
                                </div>
                                <div className="status-badge status-default" style={{ borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                    🏥
                                </div>
                            </div>
                            <div className="admin-card-body">
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Active Doctors</span>
                                    <span className="admin-card-value">{dept.doctor_count ?? '—'}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Departments
