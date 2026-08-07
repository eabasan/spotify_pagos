import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from supabase import create_client, Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = (
    create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
)


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


@app.get("/")
def home():
    return {"status": "ok", "mensaje": "API con Supabase SDK activa"}


@app.get("/pagos")
def obtener_todos_los_pagos():
    if not supabase:
        return {"casillas": {}, "historial": []}

    try:
        res_casillas = supabase.table("pagos_casillas").select("*").execute()
        casillas = {row["clave"]: bool(row["pagado"]) for row in res_casillas.data}

        res_historial = (
            supabase.table("historial_transacciones")
            .select("*")
            .order("id", desc=True)
            .execute()
        )
        historial = [
            {
                "id": row["id"],
                "persona": row["persona"],
                "fecha": row["fecha"],
                "monto": row["monto"],
                "meses": row["meses_cubiertos"].split(", "),
                "anio": row["anio"],
            }
            for row in res_historial.data
        ]

        return {"casillas": casillas, "historial": historial}
    except Exception as e:
        print("Error al leer pagos:", e)
        return {"casillas": {}, "historial": []}


@app.post("/toggle-casilla")
def toggle_casilla(data: CambioCasillaDetallado):
    if not supabase:
        return {"status": "error", "message": "Supabase no configurado"}

    try:
        clave = f"{data.anio}-{data.persona}-{data.mes}"

        supabase.table("pagos_casillas").upsert(
            {"clave": clave, "pagado": data.pagado}
        ).execute()

        fecha_hoy = datetime.now().strftime("%Y-%m-%d")
        monto = 3.50 if data.pagado else -3.50
        meses_str = data.mes if data.pagado else f"Cancelación {data.mes}"

        supabase.table("historial_transacciones").insert(
            {
                "persona": data.persona,
                "fecha": fecha_hoy,
                "monto": monto,
                "meses_cubiertos": meses_str,
                "anio": data.anio,
            }
        ).execute()

        return {"status": "ok"}
    except Exception as e:
        print("Error en toggle-casilla:", e)
        return {"status": "error", "message": str(e)}


@app.post("/registrar-pago")
def registrar_pago(data: NuevaTransaccion):
    if not supabase:
        return {"status": "error", "message": "Supabase no configurado"}

    try:
        meses_str = ", ".join(data.meses)

        supabase.table("historial_transacciones").insert(
            {
                "persona": data.persona,
                "fecha": data.fecha,
                "monto": data.monto,
                "meses_cubiertos": meses_str,
                "anio": data.anio,
            }
        ).execute()

        for mes in data.meses:
            clave = f"{data.anio}-{data.persona}-{mes}"
            supabase.table("pagos_casillas").upsert(
                {"clave": clave, "pagado": True}
            ).execute()

        return {"status": "ok"}
    except Exception as e:
        print("Error en registrar-pago:", e)
        return {"status": "error", "message": str(e)}
