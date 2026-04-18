import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}

function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#F5F3EE'
    }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
        PERFOMITY <span style={{ color: '#FF4D00' }}>COWORK</span>
      </div>
      <div style={{ color: '#666', fontSize: 14 }}>Deploying full app...</div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
