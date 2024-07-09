import {useState} from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import LoadingSpinner from "./LoadingSpinner"


function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()

        try{
            const res = await api.post("api/token/", {
                username: username,
                password: password,
            })
            if(res.status === 200){
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
                navigate("/")
            } else {
                alert("An error occcurred: " + res.statusText)
            }
        } catch (error){
            alert("An error occurred: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className="container">
        {loading && <LoadingSpinner></LoadingSpinner>}
        <form onSubmit={handleSubmit} className="form-container">

            <h1>Login</h1>
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