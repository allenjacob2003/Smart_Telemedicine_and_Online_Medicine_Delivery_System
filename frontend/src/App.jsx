import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import './styles/DashboardResponsive.css'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import PatientDashboard from './dashboard/PatientDashboard.jsx'
import DoctorDashboard from './dashboard/DoctorDashboard.jsx'
import ConsultationRequests from './doctors/ConsultationRequests.jsx'
import PrescriptionUpload from './doctors/PrescriptionUpload.jsx'
import PrescriptionHistory from './doctors/PrescriptionHistory.jsx'
import ProfileSettings from './doctors/ProfileSettings.jsx'
import PharmacyDashboard from './dashboard/PharmacyDashboard.jsx'
import AdminDashboard from './dashboard/AdminDashboard.jsx'
import HomePage from './pages/HomePage.jsx'
import PatientLogin from './pages/PatientLogin.jsx'
import PatientRegister from './pages/PatientRegister.jsx'
import MessageAdmin from './pages/MessageAdmin.jsx'
import RoleLogin from './auth/RoleLogin.jsx'
import ConsultationRequest from './patients/ConsultationRequest.jsx'
import MyAppointments from './patients/MyAppointments.jsx'
import Prescriptions from './patients/Prescriptions.jsx'
import OrderMedicines from './patients/OrderMedicines.jsx'
import MyOrders from './patients/MyOrders.jsx'
import PatientProfile from './patients/ProfileSettings.jsx'
import PatientPayments from './patients/Payments.jsx'
import MedicineOrders from './pharmacy/MedicineOrders.jsx'
import UpdateOrderStatus from './pharmacy/UpdateOrderStatus.jsx'
import Payments from './pharmacy/Payments.jsx'
import StockManagement from './pharmacy/StockManagement.jsx'
import AddMedicine from './pharmacy/AddMedicine.jsx'
import PharmacyProfile from './pharmacy/ProfileSettings.jsx'

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/role/login" element={<RoleLogin />} />
          <Route path="/message-admin" element={<MessageAdmin />} />
          <Route path="/role-login" element={<Navigate to="/role/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Patient protected routes */}
          <Route element={<ProtectedRoute allowedRole="patient" />}>
            <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
            <Route path="/patient/consultation-request" element={<ConsultationRequest />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/prescriptions" element={<Prescriptions />} />
            <Route path="/patient/order-medicines" element={<OrderMedicines />} />
            <Route path="/patient/orders" element={<MyOrders />} />
            <Route path="/patient/payments" element={<PatientPayments />} />
            <Route path="/patient/profile-settings" element={<PatientProfile />} />
          </Route>

          {/* Doctor protected routes */}
          <Route element={<ProtectedRoute allowedRole="doctor" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/consultation-requests" element={<ConsultationRequests />} />
            <Route path="/doctor/prescription-upload" element={<PrescriptionUpload />} />
            <Route path="/doctor/prescription-history" element={<PrescriptionHistory />} />
            <Route path="/doctor/profile-settings" element={<ProfileSettings />} />
          </Route>

          {/* Pharmacy protected routes */}
          <Route element={<ProtectedRoute allowedRole="pharmacy" />}>
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/orders" element={<MedicineOrders />} />
            <Route path="/pharmacy/update-order" element={<UpdateOrderStatus />} />
            <Route path="/pharmacy/payments" element={<Payments />} />
            <Route path="/pharmacy/stock" element={<StockManagement />} />
            <Route path="/pharmacy/add-medicine" element={<AddMedicine />} />
            <Route path="/pharmacy/profile-settings" element={<PharmacyProfile />} />
          </Route>

          {/* Admin protected routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
