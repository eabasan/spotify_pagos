import { useState } from 'react'

function App() {
  const [anioSeleccionado, setAnioSeleccionado] = useState(null)

  const anos = [2026, 2027, 2028, 2029, 2030]
  const personas = ['Luis', 'Angela', 'Elena', 'Claudia', 'Alejandro']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // Estado para guardar qué meses ha pagado cada persona
  const [pagos, setPagos] = useState({})

  // Función para alternar entre Pagado (true) y No Pagado (false)
  const togglePago = (anio, persona, mes) => {
    const clave = `${anio}-${persona}-${mes}`
    setPagos(prev => ({
      ...prev,
      [clave]: !prev[clave]
    }))
  }

  // Calcular el dinero total recaudado por persona (3,50€ por mes pagado)
  const calcularTotalEuros = (anio, persona) => {
    let mesesPagados = 0
    meses.forEach(mes => {
      if (pagos[`${anio}-${persona}-${mes}`]) {
        mesesPagados++
      }
    })
    const total = mesesPagados * 3.5
    // Formatea a dos decimales con coma (ej. 3,50 € o 10,50 €)
    return total.toFixed(2).replace('.', ',') + ' €'
  }

  return (
    <div style={{
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#1ed760', fontSize: '2.5rem', marginBottom: '10px' }}>
          Control de Pagos 💳
        </h1>
        <p style={{ color: '#b3b3b3' }}>Cuota mensual: <strong>3,50 € / mes</strong></p>
      </header>

      {/* Botones de Selección de Año */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {anos.map(anio => (
          <button
            key={anio}
            onClick={() => setAnioSeleccionado(anio)}
            style={{
              backgroundColor: anioSeleccionado === anio ? '#1ed760' : '#282828',
              color: anioSeleccionado === anio ? '#121212' : '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {anio}
          </button>
        ))}
      </div>

      {/* Vista de la Tabla */}
      {anioSeleccionado ? (
        <div style={{ maxWidth: '1100px', margin: '0 auto', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#ffffff', margin: 0 }}>Año {anioSeleccionado}</h2>
            <span style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>
              Haz clic en los botones para acumular 3,50 € por mes
            </span>
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#181818',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #282828', textAlign: 'center' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#b3b3b3' }}>Persona</th>
                {meses.map(mes => (
                  <th key={mes} style={{ padding: '16px', color: '#b3b3b3', fontWeight: '500' }}>{mes}</th>
                ))}
                <th style={{ padding: '16px', color: '#1ed760' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((persona, index) => {
                const totalEuros = calcularTotalEuros(anioSeleccionado, persona)
                const tienePagos = totalEuros !== '0,00 €'
                return (
                  <tr
                    key={persona}
                    style={{
                      borderBottom: index !== personas.length - 1 ? '1px solid #282828' : 'none',
                      textAlign: 'center'
                    }}
                  >
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>
                      {persona}
                    </td>
                    {meses.map(mes => {
                      const estaPagado = pagos[`${anioSeleccionado}-${persona}-${mes}`]
                      return (
                        <td key={mes} style={{ padding: '12px' }}>
                          <button
                            onClick={() => togglePago(anioSeleccionado, persona, mes)}
                            title={estaPagado ? 'Pagado (+3,50 €)' : 'Pendiente'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: estaPagado ? 'none' : '2px solid #e74c3c',
                              backgroundColor: estaPagado ? '#1ed760' : 'transparent',
                              color: estaPagado ? '#121212' : '#e74c3c',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              transition: 'transform 0.1s ease'
                            }}
                          >
                            {estaPagado ? '✓' : '✕'}
                          </button>
                        </td>
                      )
                    })}
                    <td style={{
                      padding: '16px',
                      fontWeight: 'bold',
                      color: tienePagos ? '#1ed760' : '#ffffff',
                      minWidth: '80px'
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
        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '60px' }}>
          👈 Selecciona un año de la lista para ver la tabla
        </div>
      )}
    </div>
  )
}

export default App