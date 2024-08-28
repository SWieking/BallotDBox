import {useState} from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import LoadingSpinner from "./LoadingSpinner"

function RegisterForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPW, setConfirmPW] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [IdNumber, setIdNumber] = useState("")
    const [IdPIN, setIdPIN] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        const usernameRegex = /^[A-Za-z0-9_-]+$/;

        if (username.length < 5) {
            alert("The username must be at least 5 characters long.");
            setLoading(false); 
            return; 
        }
        if (!usernameRegex.test(username)) {
            alert("The username can only contain letters, numbers, underscores (_), and dashes (-).");
            setLoading(false); 
            return;
        }
        if(password !== confirmPW){
            alert("The passwords do not match.")
            setLoading(false); 
            return
        }
        if(IdNumber.length !== 10){
            alert("The ID number must be exactly 10 characters long.")
            setLoading(false); 
            return
        }
        if(IdPIN.length !== 10){
            alert("The PIN must be 6 digits long.")
            setLoading(false); 
            return
        }

        try{
            const res = await api.post("api/user/register/", {
                username: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
                id_number: IdNumber,
                id_pin: IdPIN
            })
            if(res.status === 201){
                navigate("/login")
            }
        } catch (e){
            if (e.response && e.response.status === 400){
                setError('Registration failed. Please check your details and try again.') 
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

                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="form-input-name">
                    <input 
                        className="form-input"
                        type="text"
                        value={firstName}
                        onChange ={ (e) => setFirstName(e.target.value) }
                        placeholder="First name"
                    />
                    <input 
                        className="form-input"
                        type="text"
                        value={lastName}
                        onChange ={ (e) => setLastName(e.target.value) }
                        placeholder="Last name"
                    />
                </div>
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
                <input 
                    className="form-input"
                    type="password"
                    value={confirmPW}
                    onChange ={ (e) => setConfirmPW(e.target.value) }
                    placeholder="Confirm Password"
                    
                />
                <input 
                    className="form-input"
                    type="text"
                    value={IdNumber}
                    onChange ={ (e) => setIdNumber(e.target.value) }
                    placeholder="ID number"
                />
                <input 
                    className="form-input"
                    type="password"
                    value={IdPIN}
                    onChange ={ (e) => setIdPIN(e.target.value) }
                    placeholder="ID PIN"
                />

                <button className="submit-button" type="submit" disabled={loading}>
                    Register
                </button>
            </form>
        </div>
    )
}

export default RegisterForm