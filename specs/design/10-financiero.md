# Diseño — Módulo Financiero

**Dependencias:** Sistema base (`00-sistema-desktop.md`), Lotes (`03-lotes.md`)

---

## Principios visuales

- Moneda siempre en USD con símbolo `$` y 2 decimales.
- Resultado neto positivo: texto en color success (verde). Negativo: color destructive (rojo). Cero: color muted.
- Los costos de establecimiento se muestran en tono secundario (muted) para indicar que son informativos, no incluidos en el neto.
- Los formularios de costo son inline (expandibles) dentro de la misma card, siguiendo el patrón del resto de la app.

---

## Sección financiera en el detalle del lote

Se agrega una Card "Financiero" en `app/(app)/lots/[lotId]/page.tsx`, después de `LotWeightStatsCard`.

### Layout del P&L card

```
┌──────────────────────────────────────────────────────┐
│ Financiero                              [+ Agregar costo] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Ingresos (ventas)              $  12,500.00         │
│  Inversión en compra           −$   8,400.00         │
│  Costos directos               −$   1,320.00         │
│    · Alimentación   $980                             │
│    · Sanidad        $240                             │
│    · Otros          $100                             │
│  ─────────────────────────────────────────────────   │
│  Resultado neto                 $   2,780.00  ✓verde │
│                                                      │
│  Stock activo (ref)             $   6,300.00  (gray) │
│  Costos est. del período (ref)  $     850.00  (gray) │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Si el lote no tiene datos financieros: mostrar EmptyState con mensaje "Sin datos financieros. Registrá el precio de compra al ingresar animales y agregá costos al lote."
- Advertencia si hay animales sin `purchasePriceUsd`: "X animales sin precio de compra — resultado estimado"

### Formulario inline de costo

Al hacer clic en "+ Agregar costo", se expande un formulario dentro de la misma Card:

```
┌──────────────────────────────────────────────────────┐
│  Agregar costo directo                               │
│                                                      │
│  Categoría  [select: Alimentación ▾]                 │
│  Monto USD  [  980.00              ]                 │
│  Fecha      [  2026-04-07          ]                 │
│  Descripción [  Fardos de alfalfa...] (opcional)     │
│                                                      │
│                          [Cancelar]  [Guardar costo] │
└──────────────────────────────────────────────────────┘
```

### Historial de costos del lote

Tabla debajo del P&L card (solo si hay costos registrados):

```
Fecha       Categoría       Descripción              Cabezas   USD
07/04/26    Alimentación    Fardos de alfalfa — mar.   18     $980.00
02/04/26    Sanidad         Ivermectina lote A          20     $240.00
```

---

## Campo precio de compra en ingreso de animal

En `app/(app)/animals/new/page.tsx`, formulario de ingreso individual:

- El campo "Precio de compra (USD/cabeza)" aparece **solo cuando** `entryType === "purchase"`.
- Se ubica inmediatamente después del campo "Tipo de ingreso".
- Es opcional (no tiene asterisco).
- Placeholder: `0.00`
- Hint: "Precio pagado por cabeza en USD"

En el ingreso RFID (datos comunes), mismo campo después del "Tipo de ingreso":
- Solo visible cuando `entryType === "purchase"` (el ingreso RFID solo permite purchase/transfer).

---

## Página de establecimiento financiero (`/financiero`)

```
┌──────────────────────────────────────────────────────┐
│ Finanzas — La Esperanza                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  COSTOS GENERALES DEL ESTABLECIMIENTO                │
│                                                      │
│  Este mes                         $  1,700.00        │
│  Acumulado                        $  4,250.00        │
│                                       [+ Agregar]    │
│                                                      │
│  Fecha       Categoría       Descripción       USD   │
│  07/04/26    Mano de obra    Jornales marzo   $850   │
│  01/03/26    Mano de obra    Jornales febrero $850   │
│  15/02/26    Mantenimiento   Reparación alambrado $200 │
│  ...                                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Empty state si no hay costos registrados.
- El formulario de agregar es inline, expandible con el botón "+ Agregar".

---

## Sidebar

Nuevo ítem "Finanzas" entre "Lotes" y "Alertas", con ícono DollarSign (SVG inline, stroke-based, mismo estilo que los otros iconos SVG del sidebar).

---

## Fuera de alcance del diseño (MVP)

- Dashboard financiero multi-lote comparativo
- Gráficos de P&L histórico
- Export a CSV/PDF
