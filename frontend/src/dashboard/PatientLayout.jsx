import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import './patientLayout.css'

const BASE_URL = "http://localhost:8000"

const iconSet = {
	home: '🏠',
	file: '📝',
	calendar: '📅',
	clipboard: '📋',
	bag: '🛍️',
	package: '📦',
	card: '💳',
	user: '👤',
	bell: '🔔',
	logout: '⤴️',
	menu: '☰',
	close: '✕',
}

const navItems = [
	{ label: 'Dashboard', path: '/patient/dashboard', icon: iconSet.home },
	{ label: 'Consultation Request', path: '/patient/consultation-request', icon: iconSet.file },
	{ label: 'My Appointments', path: '/patient/appointments', icon: iconSet.calendar },
	{ label: 'Prescriptions', path: '/patient/prescriptions', icon: iconSet.clipboard },
	{ label: 'Order Medicines', path: '/patient/order-medicines', icon: iconSet.bag },
	{ label: 'My Orders', path: '/patient/orders', icon: iconSet.package },
	{ label: 'Payments', path: '/patient/payments', icon: iconSet.card },
	{ label: 'Profile Settings', path: '/patient/profile-settings', icon: iconSet.user },
]

const PatientLayout = ({ children, pageTitle = 'Patient Dashboard' }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('patientPhoto') || 'https://ui-avatars.com/api/?name=Patient&background=0ea5e9&color=ffffff')
	const [safeName, setSafeName] = useState((localStorage.getItem('patientName') || localStorage.getItem('name') || 'Patient').trim() || 'Patient')

	// Fetch latest profile data on mount to ensure sidebar shows current image
	useEffect(() => {
		const loadProfileData = async () => {
			try {
				const email = localStorage.getItem('email')
				if (email) {
					const response = await api.get('patients/profile/', { params: { email } })
					const data = response.data || {}
					
					// Update name
					if (data.full_name) {
						setSafeName(data.full_name)
						localStorage.setItem('patientName', data.full_name)
					}
					
					// Update profile photo with full URL
					if (data.profile_image) {
						const fullImageUrl = data.profile_image.startsWith('http') 
							? data.profile_image 
							: `${BASE_URL}${data.profile_image}`
						setProfilePhoto(fullImageUrl)
						localStorage.setItem('patientPhoto', fullImageUrl)
						console.log('[PatientLayout] Profile image loaded:', fullImageUrl)
					}
				}
			} catch (err) {
				console.error('[PatientLayout] Profile fetch error:', err)
				// Silent fail - use localStorage as fallback
			}
		}

		loadProfileData()
	}, [])

	const handleLogout = () => {
		localStorage.clear()
		navigate('/patient/login', { replace: true })
	}

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen)
	}

	const closeMobileMenu = () => {
		setMobileMenuOpen(false)
	}

	// Close menu on route change
	useEffect(() => {
		setMobileMenuOpen(false)
	}, [location.pathname])

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [mobileMenuOpen])

	return (
		<div className="pl-shell pl-dashboard-shell">
			{/* Mobile Overlay */}
			<div
				className={`pl-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
				onClick={closeMobileMenu}
			/>

			<aside className="pl-sidebar">
				<div className="pl-profile">
					<img src={profilePhoto} alt={safeName} />
					<div>
						<p>Welcome,</p>
						<h3>{safeName}</h3>
					</div>
				</div>
				<nav className="pl-nav">
					{navItems.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) => `pl-nav-link${isActive ? ' active' : ''}`}
						>
							<span className="pl-icon">{item.icon}</span>
							{item.label}
						</NavLink>
					))}
				</nav>
				<button type="button" className="pl-logout" onClick={handleLogout}>
					<span className="pl-icon">{iconSet.logout}</span>
					Logout
				</button>
			</aside>

			<div className="pl-main">
				<header className="pl-topbar">
					<button 
						type="button" 
						className="pl-topbar-toggle"
						onClick={toggleMobileMenu}
						aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={mobileMenuOpen}
						aria-controls="patient-mobile-nav"
					>
						{mobileMenuOpen ? iconSet.close : iconSet.menu}
					</button>
					<h2>{pageTitle}</h2>
				</header>

				{/* Mobile Dropdown Navigation (AdminDashboard-style) */}
				<div
					id="patient-mobile-nav"
					className={`pl-mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}
					role="menu"
					aria-label="Patient navigation"
				>
					{navItems.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							role="menuitem"
							className={({ isActive }) => `pl-mobile-nav-item${isActive ? ' active' : ''}`}
							onClick={closeMobileMenu}
						>
							<span className="pl-mobile-nav-icon" aria-hidden="true">
								{item.icon}
							</span>
							<span className="pl-mobile-nav-label">{item.label}</span>
						</NavLink>
					))}
					<button
						type="button"
						className="pl-mobile-nav-item pl-mobile-logout"
						onClick={() => {
							closeMobileMenu()
							handleLogout()
						}}
						role="menuitem"
					>
						<span className="pl-mobile-nav-icon" aria-hidden="true">
							{iconSet.logout}
						</span>
						<span className="pl-mobile-nav-label">Logout</span>
					</button>
				</div>
				<main className="pl-content">{children}</main>
			</div>
		</div>
	)
}

export default PatientLayout
