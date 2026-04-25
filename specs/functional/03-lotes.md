# Lotes

**Dependencias:** Establecimientos (`01-establecimientos.md`), Animales (`02-animales.md`)

---

## Concepto

Un lote es una **agrupación operativa y dinámica** de animales. Existe para facilitar el registro de actividades sobre un conjunto de animales a la vez. Los lotes no definen la existencia de un animal: un animal existe independientemente del lote al que pertenece.

Un animal puede pertenecer a un solo lote a la vez, o a ninguno.

---

## Entidad: Lote

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Nombre | Texto | Sí | Identificador legible del lote |
| Descripción | Texto | No | Información adicional |
| Establecimiento | Referencia | Sí (automático) | Hereda el establecimiento activo |
| Fecha de creación | Fecha | Sí (automático) | Generada por el sistema |
| Estado | Enum | Sí (automático) | `activo` o `disuelto` |
| Animales | Lista de Referencias | No | Puede estar vacío |

---

## Composición dinámica

- Al crear un lote, puede estar vacío o con animales asignados desde el momento de creación.
- Un animal solo puede pertenecer a un lote a la vez dentro del mismo establecimiento.
- Al agregar un animal a un lote, sale automáticamente del lote anterior (si tenía uno).
- El cambio de lote genera un evento de trazabilidad en el animal: `cambio de lote` (con lote anterior y lote nuevo).
- Los animales sin lote asignado son válidos y operables; simplemente no pertenecen a ningún grupo.

---

## Operaciones

### Crear lote

- El usuario ingresa nombre (obligatorio) y descripción (opcional).
- Opcionalmente puede agregar animales en el mismo paso, desde dos fuentes:
  - **Sin lote**: animales activos sin lote asignado. Se muestran como grilla de tags clickeables.
  - **Desde otro lote**: el usuario selecciona un lote origen y elige animales de ese lote. Al confirmar el formulario, se genera un evento de trazabilidad `cambio de lote` por cada animal movido, agrupados por lote de origen.
- El lote se crea en estado `activo`.

### Ver animales del lote

- Lista todos los animales activos del lote con sus datos básicos.
- Filtros: por categoría, por carencia activa.
- Búsqueda por caravana dentro del lote.

### Mover animales entre lotes o asignar sin lote

Operación disponible desde la pantalla dedicada `/lots/move`, accesible desde el detalle de cualquier lote activo.

- **Origen**: un lote activo o el grupo virtual "Sin lote" (animales activos sin lote asignado).
- **Destino**: cualquier lote activo distinto al origen.
- El usuario selecciona uno o varios animales del origen y confirma el movimiento al destino.
- Al confirmar: cada animal pasa al lote destino y sale del lote de origen automáticamente.
- Si el origen era un lote: se genera evento `cambio de lote` por animal, con lote anterior y lote nuevo.
- Si el origen era "Sin lote": se genera evento `cambio de lote` por animal solo con lote nuevo (sin lote anterior).
- El destino no puede ser el mismo lote que el origen.

### Quitar animal del lote

- El animal queda sin lote asignado; no se elimina ni se egresa.
- Genera evento de trazabilidad: `cambio de lote` (con lote anterior y sin lote nuevo).

### Registrar actividad sobre el lote

- El usuario selecciona el tipo de actividad (sanitaria) y completa los datos.
- El sistema aplica la actividad a **todos los animales activos del lote en ese momento**.
- Se genera un registro individual por animal (ver `04-actividades-sanitarias.md`).
- Los animales que ingresen al lote después de registrada la actividad no la heredan.

### Disolver lote

- Cambia el estado del lote a `disuelto`.
- Todos los animales del lote quedan sin lote asignado (cada animal genera un evento de trazabilidad de `cambio de lote`).
- El lote disuelto no aparece en listados operativos pero conserva su historial: qué animales tuvo, qué actividades se registraron sobre él.
- Un lote disuelto no puede reactivarse.

---

## Reglas de negocio

1. **Un animal egresado sale automáticamente del lote**: al registrarse un egreso, el animal se desvincula del lote sin necesidad de acción manual.
2. **La actividad sobre un lote es una foto del momento**: solo afecta a los animales que están en el lote cuando se registra la actividad.
3. **El historial pertenece al animal, no al lote**: si un animal cambia de lote, sus actividades pasadas no desaparecen ni se transfieren.
4. **Un lote puede estar vacío**: esto es válido; el lote existe aunque no tenga animales asignados.

---

## Estados

| Estado | Descripción | Operaciones disponibles |
|---|---|---|
| `activo` | Lote en uso | Agregar/quitar animales, registrar actividades, disolver |
| `disuelto` | Lote desactivado | Solo consulta (historial de animales y actividades) |

---

## Lote virtual "Sin lote"

- En el listado de lotes aparece una entrada especial "Sin lote" que representa todos los animales activos sin lote asignado.
- No es un lote real: no tiene ID persistente, no se puede disolver ni operar sobre él.
- Muestra el conteo de animales sin lote y navega a `/lots/sin-lote`.
- La vista `/lots/sin-lote` muestra: estadísticas de peso (si aplica) y la grilla de tags de todos los animales sin lote.

---

## Fuera de alcance (MVP)

- Sublotes o jerarquía de lotes
- Lotes que abarquen múltiples establecimientos
- Lote de origen histórico inmutable (solo existen lotes operativos dinámicos)
- Estadísticas de productividad por lote
