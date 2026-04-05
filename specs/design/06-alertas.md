# Diseño Desktop — Módulo Alertas

**Ruta**: `/alerts`  
**Propósito**: Centralizar avisos que requieren atención del usuario sobre el estado del establecimiento.

---

## 1. Layout general

```
┌────────────────────────────────────────────────────────┐
│ Page Header: "Alertas"           [N alertas activas]   │
├────────────────────────────────────────────────────────┤
│ Toolbar: [Tipo ▾]  [Urgencia ▾]          [Limpiar]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ── Críticas (N) ───────────────────────────────────  │
│  [AlertItem]                                           │
│  [AlertItem]                                           │
│                                                        │
│  ── Advertencias (N) ───────────────────────────────  │
│  [AlertItem]                                           │
│                                                        │
│  ── Informativas (N) ───────────────────────────────  │
│  [AlertItem]                                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Page Header

- Título "Alertas".
- Badge con conteo total de alertas activas (no resueltas ni desestimadas).
- Sin botón de acción primaria (las alertas son generadas por el sistema).

---

## 3. Toolbar

- **Tipo**: select multi.
  - `carencia_expiring` — Carencia próxima a vencer
  - `lot_inactive` — Lote sin actividad sanitaria
- **Urgencia**: select multi (Crítica / Advertencia / Informativa).
- **Limpiar**: link que aparece si hay filtros activos.

---

## 4. Secciones por urgencia

Las alertas se agrupan en tres secciones: Críticas, Advertencias, Informativas.

- El header de cada sección muestra: nombre de urgencia + conteo de alertas en esa categoría.
- Si una sección tiene 0 alertas activas (con los filtros aplicados): se oculta la sección completa.
- Orden dentro de cada sección: las más recientes primero.

---

## 5. AlertItem

```
┌────────────────────────────────────────────────────────┐
│ [●] Carencia activa — Ivermectina 1%          [critica]│
│     Animal: 858 000 00001 234 (Vaca)                   │
│     Vence: 7 abr 2025 (en 2 días)                      │
│                                                        │
│     [Ver animal]                      [Desestimar]     │
└────────────────────────────────────────────────────────┘
```

- **Ícono de urgencia**: punto o ícono con color (rojo = crítica, amber = advertencia, azul = informativa).
- **Badge de tipo**: label del tipo de alerta, alineado a la derecha.
- **Título**: descripción de la alerta.
- **Animal**: caravana + categoría (si aplica). Link → `/animals/[id]`.
- **Lote**: nombre del lote (si aplica). Link → `/lots/[lotId]`.
- **Fecha relevante**: vencimiento de carencia, días restantes, u otro dato temporal.

### Acciones por alerta

- **"Ver animal"** (si aplica): navega al perfil del animal.
- **"Ver lote"** (si aplica): navega al detalle del lote.
- **"Desestimar"**: marca la alerta como `dismissed`. Pide confirmación breve con tooltip o popover: "¿Desestimar esta alerta?" con botones Sí / No.

---

## 6. Tipos de alertas y su contenido

### `carencia_expiring`
- Descripción: "Carencia de [producto] vence en [N] días".
- Urgencia:
  - `critical` si la carencia ya está activa (vencida o en el día).
  - `warning` si vence en ≤ 7 días (configurable).
  - `info` si vence en ≤ 14 días (opcional, según configuración).
- Acciones: "Ver animal".

### `lot_inactive`
- Descripción: "El lote [Nombre] lleva [N] días sin actividad sanitaria".
- Urgencia: `info` por defecto.
- Acciones: "Ver lote", "Registrar actividad".

---

## 7. Estados especiales

### Sin alertas (ninguna activa)
- EmptyState: ícono de check verde + "Todo en orden. No hay alertas activas." 

### Sin resultados de filtros
- EmptyState: "Sin alertas con esos filtros" + link "Limpiar filtros".

### Alerta resuelta automáticamente
- Las alertas se resuelven automáticamente cuando la condición deja de aplicar (ej. carencia vencida, lote con nueva actividad).
- No aparecen en la lista de alertas activas.
- No hay vista de historial de alertas en MVP.
