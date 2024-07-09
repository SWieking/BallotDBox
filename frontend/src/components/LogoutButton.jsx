import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const LogoutButton = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        navigate("/login")
    }
    
    return <button onClick={handleLogout}>Logout</button>

}

export default LogoutButton