import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def init_db():
    if not DATABASE_URL:
        print("DATABASE_URL no encontrada.")
        return
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pagos_casillas (
            clave TEXT PRIMARY KEY,
            pagado BOOLEAN
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historial_transacciones (
            id SERIAL PRIMARY KEY,
            persona TEXT,
            fecha TEXT,
            monto REAL,
            meses_cubiertos TEXT,
            anio INTEGER
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()


try:
    init_db()
except Exception as e:
    print("Error al inicializar la BBDD:", e)


class CambioCasillaDetallado(BaseModel):
    anio: int
    persona: str
    mes: str
    pagado: bool


class NuevaTransaccion(BaseModel):
    persona: str
    fecha: str
    monto: float
    meses: List[str]
    anio: int


@app.get("/pagos")
def obtener_todos_los_pagos():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT clave, pagado FROM pagos_casillas;")
    rows_casillas = cursor.fetchall()
    casillas = {row["clave"]: bool(row["pagado"]) for row in rows_casillas}

    cursor.execute(
        "SELECT id, persona, fecha, monto, meses_cubiertos, anio FROM historial_transacciones ORDER BY id DESC;"
    )
    rows_historial = cursor.fetchall()
    historial = [
        {
            "id": row["id"],
            "persona": row["persona"],
            "fecha": row["fecha"],
            "monto": row["monto"],
            "meses": row["meses_cubiertos"].split(","),
            "anio": row["anio"],
        }
        for row in rows_historial
    ]

    cursor.close()
    conn.close()
    return {"casillas": casillas, "historial": historial}


@app.post("/toggle-casilla")
def toggle_casilla(data: CambioCasillaDetallado):
    conn = get_db_connection()
    cursor = conn.cursor()

    clave = f"{data.anio}-{data.persona}-{data.mes}"

    # 1. Guardar estado de la casilla
    cursor.execute(
        """
        INSERT INTO pagos_casillas (clave, pagado)
        VALUES (%s, %s)
        ON CONFLICT (clave) 
        DO UPDATE SET pagado = EXCLUDED.pagado;
    """,
        (clave, data.pagado),
    )

    # 2. Guardar en el historial siempre
    fecha_hoy = datetime.now().strftime("%Y-%m-%d")
    monto = 3.50 if data.pagado else -3.50
    meses_str = data.mes if data.pagado else f"Cancelación {data.mes}"

    cursor.execute(
        """
        INSERT INTO historial_transacciones (persona, fecha, monto, meses_cubiertos, anio)
        VALUES (%s, %s, %s, %s, %s);
    """,
        (data.persona, fecha_hoy, monto, meses_str, data.anio),
    )

    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "ok"}


@app.post("/registrar-pago")
def registrar_pago(data: NuevaTransaccion):
    conn = get_db_connection()
    cursor = conn.cursor()

    meses_str = ", ".join(data.meses)
    cursor.execute(
        """
        INSERT INTO historial_transacciones (persona, fecha, monto, meses_cubiertos, anio)
        VALUES (%s, %s, %s, %s, %s);
    """,
        (
            data.persona,
            fecha_hoy if False else data.fecha,
            data.monto,
            meses_str,
            data.anio,
        ),
    )

    for mes in data.meses:
        clave = f"{data.anio}-{data.persona}-{mes}"
        cursor.execute(
            """
            INSERT INTO pagos_casillas (clave, pagado)
            VALUES (%s, %s)
            ON CONFLICT (clave) 
            DO UPDATE SET pagado = EXCLUDED.pagado;
        """,
            (clave, True),
        )

    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "ok"}
