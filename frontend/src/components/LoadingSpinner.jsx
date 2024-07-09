
const LoadingSpinner = () => {
    return ( 
        <div className="loading-overlay">
            <svg className="loading-spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="10"></circle>
            </svg>
            
            <div>Loading...</div>
        </div>
    )
}

export default LoadingSpinner