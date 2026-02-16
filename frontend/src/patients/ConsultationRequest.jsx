import { useEffect, useState } from 'react'
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

const ConsultationRequest = () => {
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [formData, setFormData] = useState({
    department: '',
    doctor_id: '',
    symptoms: '',
    preferred_date: '',
    preferred_time: '',
    report: null,
  })
  const [message, setMessage] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await api.get('doctors/departments/')
        setDepartments(response.data || [])
      } catch (err) {
        setDepartments([])
      }
    }

    loadDepartments()
  }, [])

  const handleChange = (event) => {
    const { name, value, files } = event.target
    if (name === 'report') {
      setFormData((prev) => ({ ...prev, report: files?.[0] || null }))
    } else if (name === 'department') {
      // Reset doctor selection when department changes
      setFormData((prev) => ({ ...prev, [name]: value, doctor_id: '' }))
      // Fetch doctors for the selected department
      if (value) {
        fetchDoctorsForDepartment(value)
      } else {
        setDoctors([])
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const fetchDoctorsForDepartment = async (departmentName) => {
    setLoadingDoctors(true)
    try {
      const response = await api.get('doctors/departments/doctors/', {
        params: { department_name: departmentName },
      })
      setDoctors(response.data || [])
    } catch (err) {
      setDoctors([])
      console.error('Failed to fetch doctors:', err)
    } finally {
      setLoadingDoctors(false)
    }
  }

  const startPayment = async (requestId, amount) => {
    const email = localStorage.getItem('email')
    if (!email) {
      setMessage('Please log in to continue.')
      return
    }

    const sdkLoaded = await loadRazorpay()
    if (!sdkLoaded) {
      setMessage('Razorpay SDK failed to load.')
      return
    }

    const orderResponse = await api.post('payments/create-order/', {
      payment_type: 'consultation',
      amount: Number(amount),
      related_id: requestId,
      email,
    })

    const { order_id, key, amount: orderAmount } = orderResponse.data

    const options = {
      key,
      order_id,
      amount: Math.round(Number(orderAmount) * 100),
      currency: 'INR',
      name: 'Telemedicine',
      description: 'Consultation fee',
      prefill: { email },
      handler: async (response) => {
        try {
          await api.post('payments/verify-payment/', {
            payment_type: 'consultation',
            amount: orderAmount,
            related_id: requestId,
            email,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
          })
          setMessage('Consultation request submitted and payment successful.')
          setFormData({
            department: '',
            doctor_id: '',
            symptoms: '',
            preferred_date: '',
            preferred_time: '',
            report: null,
          })
          setDoctors([])
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
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (paymentLoading) return
    setMessage('')
    setPaymentLoading(true)
    try {
      const payload = new FormData()
      payload.append('department', formData.department)
      payload.append('doctor_id', formData.doctor_id)
      payload.append('symptoms', formData.symptoms)
      payload.append('preferred_date', formData.preferred_date)
      payload.append('preferred_time', formData.preferred_time)
      const email = localStorage.getItem('email')
      if (email) payload.append('email', email)
      if (formData.report) payload.append('report', formData.report)

      const response = await api.post('patients/consultation-request/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const requestId = response.data?.id
      const fee = response.data?.consultation_fee || 0

      if (requestId && Number(fee) > 0) {
        await startPayment(requestId, fee)
      } else {
        setMessage('Consultation request submitted successfully.')
        setFormData({
          department: '',
          doctor_id: '',
          symptoms: '',
          preferred_date: '',
          preferred_time: '',
          report: null,
        })
        setDoctors([])
        setPaymentLoading(false)
      }
    } catch (err) {
      setMessage('Failed to submit request. Please try again.')
      setPaymentLoading(false)
    }
  }

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>Consultation Request</h2>
          <p className="patient-muted">Send a new consultation request to a doctor.</p>
        </div>
      </section>

      <section className="patient-card">
        <form className="patient-form" onSubmit={handleSubmit}>
          <label>
            Department
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          {formData.department && (
            <label>
              Doctor
              <select 
                name="doctor_id" 
                value={formData.doctor_id} 
                onChange={handleChange} 
                required
                disabled={loadingDoctors}
              >
                <option value="">
                  {loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name} ({doctor.specialization}) - {doctor.experience_years} years exp.
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Symptoms
            <textarea
              name="symptoms"
              rows="4"
              placeholder="Describe your symptoms..."
              value={formData.symptoms}
              onChange={handleChange}
              required
            />
          </label>
          <div className="patient-form-inline">
            <label>
              Preferred Date
              <input type="date" name="preferred_date" value={formData.preferred_date} onChange={handleChange} />
            </label>
            <label>
              Preferred Time
              <input type="time" name="preferred_time" value={formData.preferred_time} onChange={handleChange} />
            </label>
          </div>
          <label className="patient-upload">
            Upload Report (optional)
            <input type="file" name="report" accept=".pdf,.jpg,.png" onChange={handleChange} />
          </label>
          <div className="patient-actions">
            <button className="patient-btn patient-btn-primary" type="submit" disabled={paymentLoading}>
              {paymentLoading ? 'Processing...' : 'Submit Request & Pay'}
            </button>
          </div>
          {message && <div className="patient-empty">{message}</div>}
        </form>
      </section>
    </PatientLayout>
  )
}

export default ConsultationRequest
