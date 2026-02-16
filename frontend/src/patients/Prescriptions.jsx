import { useEffect, useState } from 'react'
import api from '../api/axios'
import PatientLayout from '../dashboard/PatientLayout.jsx'

const normalizePrescription = (item) => ({
  id: item.id,
  doctorName: item.doctor_name || item.doctorName || '—',
  dateIssued: item.date_issued || item.created_at || '—',
  medicines: item.medicines || item.medicine_list || '—',
  notes: item.notes || '—',
  pdf: item.pdf || item.report || '',
})

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === '—') return '—'
    try {
      const date = new Date(dateTimeString)
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return dateTimeString
    }
  }

  const getPdfUrl = (pdfPath) => {
    if (!pdfPath) return ''
    // If it's already a full URL, return as is
    if (pdfPath.startsWith('http')) return pdfPath
    // Otherwise, construct the full URL using the backend server
    return `http://127.0.0.1:8000${pdfPath}`
  }

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('patients/prescriptions/', { params: { email } })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setPrescriptions(data.map(normalizePrescription))
      } catch (err) {
        setPrescriptions([])
      } finally {
        setLoading(false)
      }
    }

    loadPrescriptions()
  }, [])

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>Prescriptions</h2>
          <p className="patient-muted">View prescriptions shared by doctors.</p>
        </div>
      </section>

      <section className="patient-grid">
        {loading ? (
          <div className="patient-empty">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="patient-empty">No prescriptions found.</div>
        ) : (
          prescriptions.map((record) => (
            <article className="patient-card" key={record.id}>
              <div className="patient-card-row">
                <div>
                  <h3 className="patient-card-title">Dr. {record.doctorName}</h3>
                  <p className="patient-muted">Date Issued: {formatDateTime(record.dateIssued)}</p>
                </div>
                {record.pdf && (
                  <a 
                    className="patient-btn patient-btn-outline" 
                    href={getPdfUrl(record.pdf)} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    View PDF
                  </a>
                )}
              </div>
              <p className="patient-muted">Medicines: {record.medicines}</p>
              <p className="patient-muted">Notes: {record.notes}</p>
            </article>
          ))
        )}
      </section>
    </PatientLayout>
  )
}

export default Prescriptions
