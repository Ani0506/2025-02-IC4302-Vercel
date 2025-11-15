import { NextResponse } from "next/server"

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function error(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function badRequest(message = "Solicitud inválida") {
  return error(message, 400)
}

export function unauthorized(message = "No autenticado") {
  return error(message, 401)
}

export function notFound(message = "Recurso no encontrado") {
  return error(message, 404)
}

export function serverError(message = "Error interno del servidor") {
  return error(message, 500)
}

