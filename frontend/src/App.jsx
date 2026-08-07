import { useState, useEffect } from 'react'

function App() {
  const [anioSeleccionado, setAnioSeleccionado] = useState(2026)
  const [vista, setVista] = useState('tabla')
  const [pagos, setPagos] = useState({})
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)

  const [personaForm, setPersonaForm] = useState('Elena')
  const [fechaForm, setFechaForm] = useState('2026-08-20')
  const [montoForm, setMontoForm] = useState('7.00')
  const [mesesForm, setMesesForm] = useState(['Ago', 'Sep'])
  const [mostrarModal, setMostrarModal] = useState(false)

  const BACKEND_URL = 'https://prueba-tfg.onrender.com'

  const anos = [2026, 2027, 2028, 2029, 2030]
  const personas = ['Luis', 'Angela', 'Elena', 'Claudia', 'Alejandro']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const cargarDatos = () => {
    fetch(`${BACKEND_URL}/pagos`)
      .then(res => res.json())
      .then(data => {
        setPagos(data.casillas || {})
        setHistorial(data.historial || [])
        setCargando(false)
      })
      .catch(err => console.error("Error al conectar con BBDD:", err))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const togglePago = (anio, persona, mes) => {
    const clave = `${anio}-${persona}-${mes}`
    const nuevoEstado = !pagos[clave]

    setPagos(prev => ({ ...prev, [clave]: nuevoEstado }))

    fetch(`${BACKEND_URL}/toggle-casilla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, pagado: nuevoEstado })
    })
  }

  const guardarPagoDetallado = (e) => {
    e.preventDefault()
    const payload = {
      persona: personaForm,
      fecha: fechaForm,
      monto: parseFloat(montoForm),
      meses: mesesForm,
      anio: anioSeleccionado
    }

    fetch(`${BACKEND_URL}/registrar-pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      setMostrarModal(false)
      cargarDatos()
    })
  }

  const toggleSeleccionMesForm = (mes) => {
    if (mesesForm.includes(mes)) {
      setMesesForm(mesesForm.filter(m => m !== mes))
    } else {
      setMesesForm([...mesesForm, mes])
    }
  }

  const calcularTotalEuros = (anio, persona) => {
    let mesesPagados = 0
    meses.forEach(mes => {
      if (pagos[`${anio}-${persona}-${mes}`]) {
        mesesPagados++
      }
    })
    return (mesesPagados * 3.5).toFixed(2).replace('.', ',') + ' €'
  }

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', padding: '20px 10px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1ed760', fontSize: '2rem', marginBottom: '5px' }}>Control de Pagos BBDD 💳</h1>
        <p style={{ color: '#b3b3b3', margin: 0 }}>Base de Datos en Supabase</p>
      </header>

      {/* Botones de Navegación */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setVista('tabla')}
          style={{
            backgroundColor: vista === 'tabla' ? '#1ed760' : '#282828',
            color: vista === 'tabla' ? '#121212' : '#ffffff',
            border: 'none', padding: '8px 16px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          📊 Tabla
        </button>
        <button
          onClick={() => setVista('historial')}
          style={{
            backgroundColor: vista === 'historial' ? '#1ed760' : '#282828',
            color: vista === 'historial' ? '#121212' : '#ffffff',
            border: 'none', padding: '8px 16px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          📜 Historial
        </button>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', color: '#1ed760', marginTop: '40px' }}>Cargando datos desde Supabase...</div>
      ) : vista === 'tabla' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {anos.map(anio => (
              <button
                key={anio}
                onClick={() => setAnioSeleccionado(anio)}
                style={{
                  backgroundColor: anioSeleccionado === anio ? '#1ed760' : '#282828',
                  color: anioSeleccionado === anio ? '#121212' : '#ffffff',
                  border: 'none', padding: '8px 14px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {anio}
              </button>
            ))}
            <button
              onClick={() => setMostrarModal(true)}
              style={{ backgroundColor: '#ffffff', color: '#121212', border: 'none', padding: '8px 14px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ➕ Registrar Pago
            </button>
          </div>

          {/* Contenedor con Scroll Horizontal Ajustado */}
          <div style={{ maxWidth: '100%', overflowX: 'auto', margin: '0 auto', borderRadius: '12px', border: '1px solid #282828' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: '#181818' }}>
              <thead>
                <tr>
                  {/* Cabecera Fija */}
                  <th style={{
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#181818',
                    zIndex: 3,
                    padding: '12px',
                    textAlign: 'left',
                    color: '#b3b3b3',
                    borderBottom: '2px solid #282828',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
                    minWidth: '100px'
                  }}>
                    Persona
                  </th>
                  {meses.map(mes => (
                    <th key={mes} style={{ padding: '12px 10px', color: '#b3b3b3', textAlign: 'center', borderBottom: '2px solid #282828', minWidth: '45px' }}>
                      {mes}
                    </th>
                  ))}
                  <th style={{ padding: '12px', color: '#1ed760', textAlign: 'center', borderBottom: '2px solid #282828', minWidth: '70px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((persona, idx) => (
                  <tr key={persona}>
                    {/* Celda de Nombre Fija al Deslizar */}
                    <td style={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#181818',
                      zIndex: 2,
                      padding: '12px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      borderBottom: idx !== personas.length - 1 ? '1px solid #282828' : 'none',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.5)'
                    }}>
                      {persona}
                    </td>
                    {meses.map(mes => {
                      const pagado = pagos[`${anioSeleccionado}-${persona}-${mes}`]
                      return (
                        <td key={mes} style={{ padding: '8px', textAlign: 'center', borderBottom: idx !== personas.length - 1 ? '1px solid #282828' : 'none' }}>
                          <button
                            onClick={() => togglePago(anioSeleccionado, persona, mes)}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              border: pagado ? 'none' : '2px solid #e74c3c',
                              backgroundColor: pagado ? '#1ed760' : 'transparent',
                              color: pagado ? '#121212' : '#e74c3c',
                              fontWeight: 'bold', cursor: 'pointer'
                            }}
                          >
                            {pagado ? '✓' : '✕'}
                          </button>
                        </td>
                      )
                    })}
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1ed760', textAlign: 'center', borderBottom: idx !== personas.length - 1 ? '1px solid #282828' : 'none' }}>
                      {calcularTotalEuros(anioSeleccionado, persona)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>Historial de Transacciones</h2>
          {historial.length === 0 ? (
            <p style={{ color: '#b3b3b3', textAlign: 'center' }}>No hay transacciones registradas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historial.map(item => (
                <div key={item.id} style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #1ed760', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>{item.persona}</strong>
                    <div style={{ color: '#b3b3b3', fontSize: '0.85rem', marginTop: '4px' }}>
                      Fecha: {item.fecha} | Año: {item.anio}
                    </div>
                    <div style={{ color: '#1ed760', fontSize: '0.9rem', marginTop: '4px' }}>
                      Meses: {item.meses.join(', ')}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1ed760' }}>
                    +{item.monto.toFixed(2).replace('.', ',')} €
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal / Formulario */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <div style={{ backgroundColor: '#181818', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '400px', border: '1px solid #282828' }}>
            <h3 style={{ color: '#1ed760', marginTop: 0 }}>Registrar Pago Detallado</h3>
            <form onSubmit={guardarPagoDetallado}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '0.85rem' }}>Persona:</label>
                <select value={personaForm} onChange={e => setPersonaForm(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#282828', color: '#fff', border: 'none', borderRadius: '5px' }}>
                  {personas.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '0.85rem' }}>Fecha en que pagó:</label>
                <input type="date" value={fechaForm} onChange={e => setFechaForm(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#282828', color: '#fff', border: 'none', borderRadius: '5px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '0.85rem' }}>Importe (€):</label>
                <input type="number" step="0.50" value={montoForm} onChange={e => setMontoForm(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#282828', color: '#fff', border: 'none', borderRadius: '5px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Selecciona los meses que paga:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {meses.map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggleSeleccionMesForm(m)}
                      style={{
                        padding: '5px 8px', fontSize: '0.8rem', borderRadius: '5px', border: 'none',
                        backgroundColor: mesesForm.includes(m) ? '#1ed760' : '#282828',
                        color: mesesForm.includes(m) ? '#121212' : '#fff', cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '8px 12px', backgroundColor: '#282828', color: '#fff', border: 'none', borderRadius: '5px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#1ed760', color: '#121212', fontWeight: 'bold', border: 'none', borderRadius: '5px' }}>Guardar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App