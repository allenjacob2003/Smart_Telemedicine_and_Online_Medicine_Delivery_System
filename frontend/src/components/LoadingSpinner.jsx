import './LoadingSpinner.css'

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClass = `loading-spinner--${size}`
  
  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className={`loading-spinner-container ${sizeClass}`}>
          <div className="loading-spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {message && <span className="loading-spinner-text">{message}</span>}
        </div>
      </div>
    )
  }
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner-container ${sizeClass}`}>
          <div className="loading-spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {message && <span className="loading-spinner-text">{message}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={`loading-spinner-container ${sizeClass}`}>
      <div className="loading-spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <span className="loading-spinner-text">{message}</span>}
    </div>
  )
}

export default LoadingSpinner
