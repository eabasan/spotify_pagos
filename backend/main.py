from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "tfg.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Tabla para el estado de cada casilla (Año-Persona-Mes)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pagos_casillas (
            clave TEXT PRIMARY KEY,
            pagado BOOLEAN
        )
    """)
    # Tabla para el historial de transacciones detalladas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historial_transacciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            persona TEXT,
            fecha TEXT,
            monto REAL,
            meses_cubiertos TEXT,
            anio INTEGER
        )
    """)
    conn.commit()
    conn.close()


init_db()


# Modelos de datos para Pydantic
class CambioCasilla(BaseModel):
    clave: str
    pagado: bool


class NuevaTransaccion(BaseModel):
    persona: str
    fecha: str
    monto: float
    meses: List[str]
    anio: int


@app.get("/pagos")
def obtener_todos_los_pagos():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Obtener casillas
    cursor.execute("SELECT clave, pagado FROM pagos_casillas")
    casillas = {row[0]: bool(row[1]) for row in cursor.fetchall()}

    # Obtener historial
    cursor.execute(
        "SELECT id, persona, fecha, monto, meses_cubiertos, anio FROM historial_transacciones ORDER BY id DESC"
    )
    historial = [
        {
            "id": row[0],
            "persona": row[1],
            "fecha": row[2],
            "monto": row[3],
            "meses": row[4].split(","),
            "anio": row[5],
        }
        for row in cursor.fetchall()
    ]

    conn.close()
    return {"casillas": casillas, "historial": historial}


@app.post("/toggle-casilla")
def toggle_casilla(data: CambioCasilla):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO pagos_casillas (clave, pagado) VALUES (?, ?)",
        (data.clave, data.pagado),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}


@app.post("/registrar-pago")
def registrar_pago(data: NuevaTransaccion):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # 1. Insertar en el historial
    meses_str = ",".join(data.meses)
    cursor.execute(
        "INSERT INTO historial_transacciones (persona, fecha, monto, meses_cubiertos, anio) VALUES (?, ?, ?, ?, ?)",
        (data.persona, data.fecha, data.monto, meses_str, data.anio),
    )

    # 2. Marcar automáticamente como pagadas las casillas correspondientes
    for mes in data.meses:
        clave = f"{data.anio}-{data.persona}-{mes}"
        cursor.execute(
            "INSERT OR REPLACE INTO pagos_casillas (clave, pagado) VALUES (?, ?)",
            (clave, True),
        )

    conn.commit()
    conn.close()
    return {"status": "ok"}
