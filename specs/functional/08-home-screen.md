# Home Screen

**Dependencias:** Todos los módulos

---

## Propósito

La home es la pantalla principal de la app. Su objetivo es responder tres preguntas inmediatas:

1. **¿Qué pasó recientemente?** → Actividad reciente
2. **¿Qué debo atender ahora?** → Próximas acciones y alertas
3. **¿Cómo llego rápido a lo que necesito?** → Accesos rápidos y búsqueda

La home está orientada a la gestión diaria: no es un resumen estadístico, sino un punto de partida para la acción.

---

## Establecimiento activo en la home

- La home siempre refleja el **establecimiento activo** seleccionado por el usuario.
- El nombre del establecimiento activo se muestra de forma prominente (cabecera o parte superior).
- Desde la home, el usuario puede cambiar de establecimiento activo mediante un selector accesible (tap en el nombre o botón de cambio).
- Al cambiar de establecimiento, la home se actualiza con los datos del nuevo establecimiento.

---

## Secciones de la home

### 1. Actividad reciente

Muestra las últimas actividades registradas en el establecimiento activo (cualquier tipo: sanitaria, comercial, ingreso, egreso).

- Se muestran las últimas **5 actividades** con opción de ver más.
- Cada ítem muestra:
  - Tipo de actividad (ícono + etiqueta)
  - Descripción breve (ej: "Vacunación — Lote Norte", "Venta — 12 animales", "Ingreso — caravana #1234")
  - Fecha y hora
  - Acceso al detalle (tap lleva a la actividad o al animal/lote involucrado)
- Si no hay actividades recientes: mensaje de estado vacío con llamado a la acción para registrar la primera actividad.

### 2. Próximas acciones

Muestra alertas activas priorizadas y sugerencias pendientes.

- Las alertas se ordenan por urgencia: `crítica` primero, luego `advertencia`, luego `informativa` (sugerencias).
- Dentro de cada nivel de urgencia, se ordena por fecha relevante (más próxima primero).
- Se muestran las primeras **3 alertas/sugerencias** con acceso al listado completo.
- Cada ítem muestra:
  - Nivel de urgencia (visual: color o ícono)
  - Descripción breve
  - Fecha relevante (ej: "vence el 10/04")
  - Acción rápida si aplica (ej: "Ver animal", "Registrar actividad")
- Si no hay alertas activas: mensaje positivo ("Todo al día").

### 3. Accesos rápidos

Atajos fijos a las acciones más frecuentes en campo:

| Acceso rápido | Destino |
|---|---|
| Registrar actividad sanitaria | Formulario de actividad sanitaria (animal o lote) |
| Ingresar animal | Formulario de ingreso de animal |
| Ver lotes | Listado de lotes del establecimiento activo |
| Ver animales | Listado de animales del establecimiento activo |

Los accesos son fijos en el MVP (no configurables por el usuario).

### 4. Búsqueda global

- Barra de búsqueda accesible desde la home.
- Busca por **número de caravana** o **nombre/alias** de animal dentro del establecimiento activo.
- También permite buscar **lotes** por nombre.
- Los resultados muestran: tipo (animal o lote), caravana o nombre, estado (activo / egresado / disuelto).
- Tap en un resultado lleva directamente al perfil del animal o detalle del lote.
- La búsqueda opera sobre datos locales (funciona offline).

---

## Estados especiales de la home

### Sin establecimiento creado (onboarding)

- Si el usuario no tiene establecimientos activos, no se muestra la home normal.
- Se muestra una pantalla de bienvenida con:
  - Descripción breve de la app
  - Botón de llamado a la acción: "Crear mi primer establecimiento"
- El usuario no puede acceder a ninguna sección hasta crear un establecimiento.

### Establecimiento sin animales (estado vacío)

- La home muestra el establecimiento activo con las secciones en estado vacío.
- La sección de actividad reciente muestra: "Aún no hay actividades registradas".
- Los accesos rápidos siguen disponibles, con énfasis en "Ingresar animal" como primera acción sugerida.

### Modo sin conexión

- La home funciona normalmente con los datos disponibles localmente (última sincronización).
- Se muestra un indicador visual de estado offline (banner o ícono).
- La actividad reciente y las alertas muestran los datos locales disponibles.
- La búsqueda funciona sobre datos locales.
- Si hay operaciones pendientes de sincronización, se muestra un contador o indicador de "N operaciones pendientes".

---

## Fuera de alcance (MVP)

- Accesos rápidos configurables por el usuario
- Widget de resumen numérico en la home (queda en el dashboard)
- Notificaciones push desde la home
- Vista de home multi-establecimiento (una sola vista con datos de todos los campos)
- Feed de actividad de otros usuarios (en caso de roles múltiples futuros)
