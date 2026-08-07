import { useState, useEffect } from 'react'

function App() {
  const [anioSeleccionado, setAnioSeleccionado] = useState(null)

  const anos = [2026, 2027, 2028, 2029, 2030]
  const personas = ['Luis', 'Angela', 'Elena', 'Claudia', 'Alejandro']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // Cargar pagos guardados del localStorage del navegador al iniciar
  const [pagos, setPagos] = useState(() => {
    const pagosGuardados = localStorage.getItem('control_pagos_tfg')
    return pagosGuardados ? JSON.parse(pagosGuardados) : {}
  })

  // Cada vez que cambie 'pagos', lo guardamos automáticamente en la memoria del teléfono
  useEffect(() => {
    localStorage.setItem('control_pagos_tfg', JSON.stringify(pagos))
  }, [pagos])

  const togglePago = (anio, persona, mes) => {
    const clave = `${anio}-${persona}-${mes}`
    setPagos(prev => ({
      ...prev,
      [clave]: !prev[clave]
    }))
  }

  const calcularTotalEuros = (anio, persona) => {
    let mesesPagados = 0
    meses.forEach(mes => {
      if (pagos[`${anio}-${persona}-${mes}`]) {
        mesesPagados++
      }
    })
    const total = mesesPagados * 3.5
    return total.toFixed(2).replace('.', ',') + ' €'
  }

  return (
    <div style={{
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px 10px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1ed760', fontSize: '2rem', marginBottom: '8px' }}>
          Control de Pagos 💳
        </h1>
        <p style={{ color: '#b3b3b3', margin: 0 }}>Cuota mensual: <strong>3,50 € / mes</strong></p>
      </header>

      {/* Selector de Año */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {anos.map(anio => (
          <button
            key={anio}
            onClick={() => setAnioSeleccionado(anio)}
            style={{
              backgroundColor: anioSeleccionado === anio ? '#1ed760' : '#282828',
              color: anioSeleccionado === anio ? '#121212' : '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {anio}
          </button>
        ))}
      </div>

      {/* Tabla con Columna Fijada (Sticky) */}
      {anioSeleccionado ? (
        <div style={{ maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#ffffff', margin: 0 }}>Año {anioSeleccionado}</h2>
            <span style={{ color: '#b3b3b3', fontSize: '0.8rem' }}>👈 Desliza la tabla</span>
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            backgroundColor: '#181818',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #282828' }}>
                {/* Columna fija de cabecera */}
                <th style={{
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#181818',
                  zIndex: 2,
                  padding: '14px 12px',
                  textAlign: 'left',
                  color: '#b3b3b3',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.5)'
                }}>
                  Persona
                </th>
                {meses.map(mes => (
                  <th key={mes} style={{ padding: '14px 10px', color: '#b3b3b3', fontWeight: '500', textAlign: 'center' }}>
                    {mes}
                  </th>
                ))}
                <th style={{ padding: '14px 12px', color: '#1ed760', textAlign: 'center' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((persona, index) => {
                const totalEuros = calcularTotalEuros(anioSeleccionado, persona)
                const tienePagos = totalEuros !== '0,00 €'
                return (
                  <tr key={persona}>
                    {/* Columna fija con el nombre */}
                    <td style={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#181818',
                      zIndex: 1,
                      padding: '14px 12px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      borderBottom: index !== personas.length - 1 ? '1px solid #282828' : 'none',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.5)'
                    }}>
                      {persona}
                    </td>

                    {meses.map(mes => {
                      const estaPagado = pagos[`${anioSeleccionado}-${persona}-${mes}`]
                      return (
                        <td key={mes} style={{
                          padding: '10px',
                          textAlign: 'center',
                          borderBottom: index !== personas.length - 1 ? '1px solid #282828' : 'none'
                        }}>
                          <button
                            onClick={() => togglePago(anioSeleccionado, persona, mes)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              border: estaPagado ? 'none' : '2px solid #e74c3c',
                              backgroundColor: estaPagado ? '#1ed760' : 'transparent',
                              color: estaPagado ? '#121212' : '#e74c3c',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {estaPagado ? '✓' : '✕'}
                          </button>
                        </td>
                      )
                    })}

                    <td style={{
                      padding: '14px 12px',
                      fontWeight: 'bold',
                      color: tienePagos ? '#1ed760' : '#ffffff',
                      textAlign: 'center',
                      borderBottom: index !== personas.length - 1 ? '1px solid #282828' : 'none'
                    }}>
                      {totalEuros}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '50px' }}>
          👈 Selecciona un año para empezar
        </div>
      )}
    </div>
  )
}

export default App