const PrescriptionView = () => {
  return (
    <div className="page">
      <h2>Prescription</h2>
      <div className="card">
        <p><strong>Doctor:</strong> Dr. Sample</p>
        <p><strong>Date:</strong> 2026-01-17</p>
        <p><strong>Medicines:</strong></p>
        <ul>
          <li>Paracetamol 500mg - 2 times/day</li>
          <li>Vitamin C - 1 time/day</li>
        </ul>
        <p><strong>Notes:</strong> Take after food.</p>
      </div>
    </div>
  )
}

export default PrescriptionView
