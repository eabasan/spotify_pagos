import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Reemplaza 'localhost' por la IP de tu PC cuando pruebes desde la tablet
    fetch('https://prueba-tfg.onrender.com/kpis')
      .then((respuesta) => respuesta.json())
      .then((data) => {
        setDatos(data)
        setCargando(false)
      })
      .catch((error) => console.error("Error conectando al backend:", error))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#4F46E5' }}>Panel de Control de Elena 📊</h1>
      <p>Trabajo Fin de Grado - Universidad Pablo de Olavide</p>

      {cargando ? (
        <p>Cargando datos del servidor...</p>
      ) : (
        <div style={{ border: '2px solid #4F46E5', borderRadius: '12px', padding: '20px', display: 'inline-block', backgroundColor: '#F9FAFB' }}>
          <h2>Resumen Ejecutivo</h2>
          <p><strong>Usuarios Activos:</strong> {datos.usuarios_activos}</p>
          <p><strong>Rendimiento:</strong> {datos.rendimiento}</p>
          <p><strong>Estado:</strong> {datos.estado_sistema}</p>
        </div>
      )}
    </div>
  )
}

export default App