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
- Opcionalmente puede agregar animales en el mismo paso.
- El lote se crea en estado `activo`.

### Ver animales del lote

- Lista todos los animales activos del lote con sus datos básicos.
- Filtros: por categoría, por carencia activa.
- Búsqueda por caravana dentro del lote.

### Agregar animales al lote

- El usuario busca y selecciona animales del establecimiento (solo activos).
- Si un animal ya estaba en otro lote, el sistema informa el lote actual y pide confirmación antes de moverlo.
- Al confirmar, el animal queda asignado al nuevo lote.

### Mover animal entre lotes

- Equivale a agregar el animal al nuevo lote: sale del anterior automáticamente.
- Se puede hacer desde el perfil del animal (cambiar lote) o desde la vista del lote (agregar animal ya asignado a otro).

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

## Fuera de alcance (MVP)

- Sublotes o jerarquía de lotes
- Lotes que abarquen múltiples establecimientos
- Lote de origen histórico inmutable (solo existen lotes operativos dinámicos)
- Estadísticas de productividad por lote
