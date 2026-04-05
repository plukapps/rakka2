# Futuro: Alertas de GDP

**Estado**: No implementar en esta fase. Solo documentación para futuro.

---

## Tipos de alerta propuestos

### 1. GDP por debajo de umbral

- **Trigger**: al registrar un pesaje, si `gdpRecent` de un animal cae por debajo de un umbral configurable.
- **Umbral**: configurable por el usuario a nivel de establecimiento o lote (ej: 0.5 kg/día).
- **Urgencia**: `warning` si está un 20% por debajo, `critical` si está un 50% por debajo.
- **Descripción**: "El animal [caravana] tiene una GDP de X.XX kg/día, por debajo del mínimo esperado de Y kg/día."

### 2. Peso estancado

- **Trigger**: si un animal tiene un pesaje donde `gdpRecent ≤ 0` (no ganó peso o perdió).
- **Urgencia**: `warning`.
- **Descripción**: "El animal [caravana] no ganó peso entre los últimos 2 pesajes (GDP: X.XX kg/día)."

### 3. Peso objetivo cercano (a nivel lote)

- **Trigger**: si el lote tiene un `targetWeight` configurado y el peso promedio actual está dentro del 10%.
- **Urgencia**: `info`.
- **Descripción**: "El lote [nombre] está cerca del peso objetivo (XXX/YYY kg). Estimado: Z días."

---

## Requisitos previos

- Implementar configuración de umbrales de GDP (por establecimiento o por lote).
- Agregar `targetWeight` persistido al lote (actualmente es ad-hoc).
- Extender el sistema de alertas existente (`/alerts/`) con los nuevos tipos.
- Cloud Function que evalúa las condiciones al crear un pesaje.

## Referencia

- Sistema de alertas actual: `specs/functional/07-alertas-y-dashboard.md`
- Modelo de alertas: `specs/technical/02-modelo-de-datos.md` (nodo `/alerts/`)
- GDP actual: `specs/functional/10-actividades-campo.md` (sección GDP)
