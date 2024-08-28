import react from 'react'
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import { useState } from 'react'
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Vote from "./pages/Vote"
import ElectionResults from './pages/ElectionResults'

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}



function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
          <Route path="/register" element={<RegisterAndLogout />}/>
          <Route path="/vote" element={<ProtectedRoute><Vote/></ProtectedRoute>} />
          <Route path="/election-results" element={<ProtectedRoute><ElectionResults/></ProtectedRoute>} />
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
     
    </>
  )
}

export default App
