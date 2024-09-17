import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useEffect, useState } from "react"
import LoadingSpinner from "./LoadingSpinner"

function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null)

    useEffect(() => {
        (async () => { 
        try{
            auth() //check the current authentication status on component mount
        } catch (error){
            alert(`Authentication error: ${error}`)
            setIsAuthorized(false) //set authorization to false if an error occurs
        }
        })()
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try{
            //attempt to refresh the access token using the refresh token
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken 
            })
            //set authorization to true if token refresh is successful, else false
            if(res.status === 200){
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true) 
            } else {
                setIsAuthorized(false)
            }
        } catch (e) {
            setIsAuthorized(false)
        }
        
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN)

        //set authorization to false if no access token is found
        if(!token) {
            setIsAuthorized(false)
            return
        }

        //decode the JWT token to check its expiration
        const decoded =  jwtDecode(token)
        const tokenExpiration = decoded.exp
        const now = Date.now() / 1000

        //refresh the token if it has expired, otherwise set authorization to true        
        if (tokenExpiration < now){
            await refreshToken()
        } else {
            setIsAuthorized(true)
        }
    }

    if (isAuthorized == null){
        return <LoadingSpinner/>
    }
    
    //redirect to login if not authorized
    return isAuthorized ? children : <Navigate to="/login" />
}

export default ProtectedRoute
