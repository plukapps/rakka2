# Trazabilidad

**Dependencias:** Animales (`02-animales.md`), Lotes (`03-lotes.md`), Framework de actividades (`04-actividades-framework.md`) y todos los specs de tipos de actividad (`04` al `13`)

---

## Concepto

La trazabilidad es la **línea de vida completa de un animal**: la secuencia cronológica de todos los eventos que ocurrieron desde su ingreso al establecimiento hasta su egreso (o hasta el momento actual si sigue activo).

La trazabilidad no es un módulo que el usuario opera directamente: es el resultado de registrar eventos en todos los demás módulos. Cada vez que se registra una actividad sobre un animal —directamente o a través de un lote— se genera un evento en su línea de trazabilidad.

---

## Eventos trazables

Todos los eventos incluyen como mínimo: **tipo, fecha, responsable** (quién registró) **y descripción resumida**.

| Tipo de evento | Generado por | Atributos adicionales |
|---|---|---|
| `ingreso` | Registro de ingreso del animal | Motivo (compra, nacimiento, transferencia), procedencia |
| `asignación a lote` | Agregar animal a un lote | Lote asignado |
| `cambio de lote` | Mover animal de lote | Lote anterior, lote nuevo |
| `salida de lote` | Quitar animal de lote o disolver lote | Lote del que salió |
| `actividad sanitaria` | Registro de vacuna o tratamiento | Subtipo, producto, dosis, vía, días de carencia, vencimiento |
| `actividad comercial` | Confirmación de venta o despacho | Subtipo (venta/despacho), comprador, destino, precio |
| `control de campo` | Pesaje, conteo, revisión, etc. | Subtipo, valor/resultado |
| `movimiento` | Traslado entre potreros o campos | Subtipo, origen, destino |
| `reproducción` | Servicio, preñez, parto, destete | Subtipo, resultado |
| `actividad general` | Registro libre del usuario | Título |
| `lectura RFID` | Actividad de lectura RFID (Bluetooth o archivo) | Método (bluetooth/archivo) |
| `egreso` | Cualquier tipo de egreso | Tipo de egreso (venta, muerte, transferencia), referencia a actividad si aplica |
| `corrección` | Registro manual de corrección | Descripción de la corrección, referencia al evento corregido |

---

## Inmutabilidad del historial

**Los eventos no se pueden eliminar ni modificar.** Esta es una regla de negocio crítica para la integridad de la trazabilidad.

Si un usuario cometió un error al registrar un evento:
- No puede editarlo ni borrarlo.
- Puede registrar un **evento de corrección** que describa el error y la información correcta.
- El evento original permanece visible en el historial, marcado como "corregido".
- El evento de corrección queda en la línea de tiempo en el momento en que fue registrado (no en la fecha del evento original).

---

## Vista de historial individual

Accesible desde el perfil de cada animal.

**Presentación:**
- Línea de tiempo cronológica, más reciente primero.
- Cada evento muestra: tipo (con ícono), fecha, descripción resumida, responsable.
- Al expandir un evento: detalle completo con todos sus atributos.

**Filtros disponibles:**
- Por tipo de evento (sanitario, comercial, movimiento, ingreso/egreso)
- Por rango de fechas

**Ordenamiento:** cronológico inverso (no modificable por el usuario).

---

## Animal egresado

Cuando un animal registra un egreso, su perfil pasa a estado `egresado` y:

- El perfil es **consultable** en cualquier momento futuro con su historial completo.
- Se muestra un indicador visual claro de que el animal ya no está activo: tipo de egreso y fecha.
- No aparece en los listados operativos por defecto, pero se puede encontrar activando el filtro "incluir egresados" o buscando directamente por caravana.
- No puede recibir nuevas actividades.

---

## Fuera de alcance (MVP)

- Trazabilidad geográfica (geolocalización de eventos)
- Exportación del historial en formato PDF o planilla
- Trazabilidad genealógica (madre, padre, crías)
- Comparación de históricos entre animales
- Integración con trazabilidad oficial (SENASA / SIGSA)
