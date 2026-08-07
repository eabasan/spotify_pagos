from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Permitir que React (Frontend) pueda comunicarse con FastAPI (Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen (ideal para desarrollo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "¡Conexión exitosa desde el Backend!"}

@app.get("/kpis")
def obtener_kpis():
    # Simulamos datos que podrías mostrar en tu TFG
    return {
        "usuarios_activos": 124,
        "rendimiento": "98.5%",
        "estado_sistema": "Operativo"
    }