import {useState} from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import LoadingSpinner from "./LoadingSpinner"


function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        setLoading(true)
        //prevent the default form submission behavior
        e.preventDefault() 

        try{
            const res = await api.post("api/token/", {
                username: username,
                password: password,
            })
            //store the tokens in local storage on successful login
            if(res.status === 200){
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
                //redirect to the homepage after successful login
                navigate("/") 
            }
        } catch (e){
            if (e.response && e.response.status === 401) {
                setError("Invalid credentials, please try again.")
            } else {
                alert("An error occurred: " + e.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className="container">
        {loading && <LoadingSpinner/>}
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <input 
                className="form-input"
                type="text"
                value={username}
                onChange ={ (e) => setUsername(e.target.value) }
                placeholder="Username"
            />
            <input 
                className="form-input"
                type="password"
                value={password}
                onChange ={ (e) => setPassword(e.target.value) }
                placeholder="Password"
            />
            <button className="submit-button" type="submit" disabled={loading}>
                Login
            </button>
        </form>
    </div>)
}

export default LoginForm