# Establecimientos

**Dependencias:** ninguna (módulo base)

---

## Entidad: Establecimiento

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Nombre | Texto | Sí | Identifica al campo de forma legible |
| Descripción | Texto | No | Información adicional libre |
| Ubicación | Texto libre | No | Localidad, provincia, referencia geográfica. No hay mapa en MVP. |
| Fecha de creación | Fecha | Sí (automático) | Generada por el sistema al crear |
| Estado | Enum | Sí (automático) | `activo` o `archivado` |

---

## Operaciones

### Crear establecimiento

- El usuario ingresa nombre (obligatorio), descripción y ubicación (opcionales).
- Al confirmar, el sistema genera el establecimiento en estado `activo` y registra la fecha de creación.
- Si es el primer establecimiento del usuario, se convierte automáticamente en el establecimiento activo.

### Ver detalle

- Muestra todos los atributos del establecimiento.
- Muestra resumen de contenido: cantidad de animales activos, cantidad de lotes activos.
- Acceso desde el selector de establecimiento o desde ajustes.

### Editar

- Permite modificar nombre, descripción y ubicación.
- No se puede modificar la fecha de creación.
- Disponible solo en establecimientos con estado `activo`.

### Archivar

- Cambia el estado a `archivado`.
- **Restricción**: no se puede archivar un establecimiento que tenga animales activos. El sistema muestra cuántos animales activos quedan y bloquea la acción.
- Un establecimiento archivado no aparece en el selector principal pero es consultable desde el historial.
- El archivado no es destructivo: todos los datos (animales, actividades, historial) se conservan.

---

## Contexto activo

El usuario siempre opera dentro de un **establecimiento activo**. Es el contexto de toda la app.

- El establecimiento activo se muestra de forma visible y persistente en la interfaz (nombre en cabecera o barra superior).
- El usuario puede cambiar el establecimiento activo desde cualquier pantalla mediante un selector.
- Al cambiar de establecimiento activo: se limpia el contexto de navegación y se cargan los datos del nuevo establecimiento.
- En modo offline, el usuario puede cambiar al establecimiento activo solo si sus datos ya fueron descargados previamente.

### Estado onboarding (sin establecimientos)

- Si el usuario no tiene establecimientos creados (primer acceso o todos archivados), la app muestra una pantalla de bienvenida con llamado a la acción para crear el primer establecimiento.
- No se puede acceder a ninguna otra sección hasta tener al menos un establecimiento activo.

---

## Estados

| Estado | Descripción | Operaciones disponibles |
|---|---|---|
| `activo` | Establecimiento en uso | Ver, editar, archivar, todas las operaciones de sus módulos |
| `archivado` | Establecimiento inactivo | Solo consulta (historial, detalle); no se puede seleccionar como activo ni operar sobre él |

---

## Fuera de alcance (MVP)

- Geolocalización del establecimiento (coordenadas GPS, mapa)
- Compartir un establecimiento con otro usuario
- Transferencia de propiedad de un establecimiento
- Eliminación definitiva de un establecimiento
