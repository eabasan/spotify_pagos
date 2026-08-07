import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Reemplaza 'localhost' por la IP de tu PC cuando pruebes desde la tablet
    fetch('http://192.168.1.239:8000/kpis')
      .then((respuesta) => respuesta.json())
      .then((data) => {
        setDatos(data)
        setCargando(false)
      })
      .catch((error) => console.error("Error conectando al backend:", error))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Dashboard de Prueba TFG 🚀</h1>

      {cargando ? (
        <p>Cargando datos del servidor...</p>
      ) : (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', display: 'inline-block' }}>
          <h2>Estado del Sistema</h2>
          <p><strong>Usuarios Activos:</strong> {datos.usuarios_activos}</p>
          <p><strong>Rendimiento:</strong> {datos.rendimiento}</p>
          <p><strong>Estado:</strong> {datos.estado_sistema}</p>
        </div>
      )}
    </div>
  )
}

export default App