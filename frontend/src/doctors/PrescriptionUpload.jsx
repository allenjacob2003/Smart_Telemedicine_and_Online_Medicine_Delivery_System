import { useEffect, useState } from 'react'
import api from '../api/axios'
import DoctorLayout from '../dashboard/DoctorLayout.jsx'

const normalizePatient = (item) => {
  const name = item.name || item.full_name || item.user?.full_name || item.user?.name || 'Unknown'
  return {
    id: item.id || item.patient_id || item.user?.id,
    name,
    email: item.email || item.user?.email || '—',
    phone: item.phone || item.phone_number || item.user?.phone || '—',
  }
}

const PrescriptionUpload = () => {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: '',
    notes: '',
    file: null,
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)

  useEffect(() => {
    if (!query.trim()) {
      setPatients([])
      return
    }

    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await api.get(`doctors/search-patient/?name=${encodeURIComponent(query)}`)
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setPatients(data.map(normalizePatient))
      } catch (err) {
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    const handler = setTimeout(fetchPatients, 400)
    return () => clearTimeout(handler)
  }, [query])

  const handleSelect = (patient) => {
    setSelectedPatient(patient)
    setStatusMessage('')
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files?.[0] || null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedPatient?.id) {
      setStatusMessage('Please select a patient first.')
      return
    }

    try {
      const payload = new FormData()
      const email = localStorage.getItem('email')
      if (email) {
        payload.append('doctor_email', email)
      }
      payload.append('patient_id', selectedPatient.id)
      payload.append('diagnosis', formData.diagnosis)
      payload.append('medicines', formData.medicines)
      payload.append('notes', formData.notes)
      if (formData.file) {
        payload.append('pdf', formData.file)
      }

      await api.post('doctors/upload-prescription/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setStatusMessage('Prescription uploaded successfully.')
      setFormData({ diagnosis: '', medicines: '', notes: '', file: null })
      setFileInputKey((prev) => prev + 1)
    } catch (err) {
      setStatusMessage('Failed to upload prescription. Please try again.')
    }
  }

  return (
    <DoctorLayout>
      <section className="doctor-card doctor-card-header">
        <div>
          <h2>Prescription Upload</h2>
          <p className="doctor-muted">Search patients and upload new prescriptions per visit.</p>
        </div>
        <div className="doctor-search">
          <input
            type="text"
            placeholder="Search patient by name..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <section className="doctor-grid">
        {loading ? (
          <div className="doctor-empty">Searching patients...</div>
        ) : patients.length === 0 ? (
          <div className="doctor-empty">Type a patient name to see matches.</div>
        ) : (
          patients.map((patient) => (
            <article className="doctor-card" key={patient.id}>
              <h3 className="doctor-card-title">{patient.name}</h3>
              <p className="doctor-muted">{patient.email}</p>
              <p className="doctor-muted">Phone: {patient.phone}</p>
              <button
                className="doctor-btn doctor-btn-primary"
                type="button"
                onClick={() => handleSelect(patient)}
              >
                Upload Prescription
              </button>
            </article>
          ))
        )}
      </section>

      <section className="doctor-card">
        <h3 className="doctor-card-title">Upload Prescription Form</h3>
        {selectedPatient ? (
          <p className="doctor-muted">Selected patient: {selectedPatient.name}</p>
        ) : (
          <p className="doctor-muted">Select a patient to start the prescription.</p>
        )}

        <form className="doctor-form" onSubmit={handleSubmit}>
          <label>
            Diagnosis
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Diagnosis details"
              rows="3"
              required
            />
          </label>
          <label>
            Medicines List
            <textarea
              name="medicines"
              value={formData.medicines}
              onChange={handleChange}
              placeholder="Medicine name, dosage, duration"
              rows="3"
              required
            />
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows="3"
            />
          </label>
          <label>
            Optional PDF
            <input
              key={fileInputKey}
              type="file"
              name="file"
              accept="application/pdf"
              onChange={handleChange}
            />
          </label>
          <div className="doctor-actions">
            <button className="doctor-btn doctor-btn-primary" type="submit">
              Submit Prescription
            </button>
          </div>
          {statusMessage && <div className="doctor-status-message">{statusMessage}</div>}
        </form>
      </section>
    </DoctorLayout>
  )
}

export default PrescriptionUpload
