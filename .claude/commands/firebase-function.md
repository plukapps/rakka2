# Scaffold Cloud Function

Crea una nueva Cloud Function para: $ARGUMENTS

Seguir el patrón definido en `specs/technical/04-cloud-functions.md`:

1. Definir el **trigger** (RTDB `onValueCreated` / `onValueUpdated`, o `onSchedule`)
2. Agregar la función en el archivo correspondiente dentro de `code/functions/src/`
3. Exportarla desde `code/functions/src/index.ts`

Reglas obligatorias:
- Usar **Admin SDK** (nunca el SDK cliente dentro de Functions)
- La función debe ser **idempotente**: si se ejecuta dos veces por el mismo evento, el resultado es el mismo
- Para escribir en `/traceability/`, usar el `activityId` como parte del `eventId` para evitar duplicados
- Manejar errores con try/catch y loguear con `logger.error()`

No crear HTTP endpoints (callable functions) en MVP — solo triggers de RTDB y scheduled.
