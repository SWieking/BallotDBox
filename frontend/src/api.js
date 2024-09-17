import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

//create an Axios instance with URL from environment variables
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL
})

//add a request interceptor to include the access token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
