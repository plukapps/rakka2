# Diseño Desktop — Home / Dashboard

**Ruta**: `/home`  
**Propósito**: Pantalla de entrada. Responde tres preguntas: ¿qué pasó? ¿qué atender? ¿cómo arranco?

---

## 1. Layout general

Diseño de **dos columnas** en desktop: columna principal (izquierda, ~65%) y columna secundaria (derecha, ~35%).

```
┌────────────────────────────────────────────────────────┐
│ Page Header                                            │
│ "Buenos días, [Nombre]" + nombre del establecimiento   │
├──────────────────────────────┬─────────────────────────┤
│                              │                         │
│  BÚSQUEDA GLOBAL             │  PRÓXIMAS ACCIONES      │
│                              │  (alertas top 3)        │
│  ACCESOS RÁPIDOS (4 botones) │                         │
│                              ├─────────────────────────┤
│  ACTIVIDAD RECIENTE          │  RESUMEN DEL CAMPO      │
│  (últimas 5 actividades)     │  (métricas clave)       │
│                              │                         │
└──────────────────────────────┴─────────────────────────┘
```

---

## 2. Page Header

- **Título**: "Buenos días / tardes / noches, [Nombre del usuario]"
- **Subtítulo**: Nombre del establecimiento activo.
- Sin botón de acción primaria en esta página (los accesos rápidos cumplen esa función).

---

## 3. Sección: Búsqueda global

Barra de búsqueda prominente en la parte superior del contenido.

- **Input**: placeholder "Buscar animal por caravana o nombre..."
- **Comportamiento**: búsqueda en tiempo real (debounce 300ms).
- **Resultados**: dropdown debajo del input con máximo 5 resultados.
  - Cada resultado muestra: caravana (formato corto), categoría, estado (badge), lote actual (si tiene).
  - Click en resultado → navega a `/animals/[id]`.
- **Sin resultados**: texto "Sin coincidencias para [término]".

---

## 4. Sección: Accesos rápidos

Grid de **4 botones** en una fila horizontal (o 2x2 si el espacio lo requiere).

| Botón | Destino |
|---|---|
| Registrar actividad | `/activities/new` |
| Ingresar animal | `/animals/new` |
| Ver lotes | `/lots` |
| Ver animales | `/animals` |

- Cada botón: ícono grande + texto + fondo de card con hover.
- Tamaño uniforme.

---

## 5. Sección: Actividad reciente

Lista de las últimas **5 actividades** registradas en el establecimiento.

### Por cada actividad
- **Tipo** (badge con color): Sanitaria, Comercial, Campo, Movimiento, Reproducción, General.
- **Descripción corta**: ej. "Vacunación — Ivermectina 1%" o "Venta — 12 animales".
- **Cantidad de animales**: "X animales".
- **Fecha**: relativa ("hace 2 días") con tooltip de fecha exacta.
- **Responsable**.
- Click → navega a la actividad (si existe vista de detalle) o al módulo.

### Footer
- Link "Ver todas las actividades" → `/activities`.

---

## 6. Sección: Próximas acciones (columna derecha, arriba)

Top **3 alertas** ordenadas por urgencia (críticas primero).

### Por cada alerta
- **Urgencia**: ícono + color (rojo crítica, amber advertencia, azul informativa).
- **Descripción**: texto de la alerta.
- **Animal**: caravana + link al animal.
- **Acción**: botón o link contextual (ej. "Ver animal").

### Footer
- Link "Ver todas las alertas" → `/alerts`.
- Si no hay alertas: estado vacío pequeño ("Todo en orden").

---

## 7. Sección: Resumen del campo (columna derecha, abajo)

Métricas rápidas del establecimiento. No son interactivas, solo informativas.

| Métrica | Descripción |
|---|---|
| Total animales activos | Número entero |
| Con carencia activa | Número + badge warning/danger si > 0 |
| Lotes activos | Número |
| Sin actividad sanitaria (+30 días) | Número |

Cada métrica: label + número en grande. Layout de grilla 2x2.

---

## 8. Estados especiales

### Sin establecimiento seleccionado
- Ocultar todas las secciones de contenido.
- Mostrar EmptyState central: "Seleccioná un establecimiento para comenzar" + botón "Crear establecimiento" si no tiene ninguno.

### Establecimiento vacío (sin animales)
- Mostrar accesos rápidos (siempre visibles).
- Actividad reciente: EmptyState "Todavía no hay actividad. Comenzá ingresando animales."
- Próximas acciones: EmptyState "Sin alertas activas."
- Resumen del campo: mostrar todo en 0.

### Offline
- Mostrar banner de offline (ver `00-sistema-desktop.md`).
- La data cacheada se muestra normalmente.
- La búsqueda global solo busca en datos locales.
