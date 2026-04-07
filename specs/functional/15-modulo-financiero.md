# Módulo Financiero Básico

**Dependencias:** Animales (`02-animales.md`), Lotes (`03-lotes.md`), Actividades comerciales (`05-actividades-comerciales.md`)

> Este módulo es independiente de las actividades operativas (sanitarias, de campo). Las actividades registran hechos; el módulo financiero registra su dimensión económica por separado.

---

## Objetivo

Dar visibilidad del resultado económico por lote: cuánto se invirtió, cuánto se recuperó en ventas, y cuál es el margen real. Permite pasar de "libreta de campo" a herramienta de decisión: saber el costo real por kg producido es lo que define cuándo vender.

---

## Moneda

**Toda operación financiera del sistema se registra y muestra en dólares estadounidenses (USD).**

- El usuario convierte a USD antes de registrar (tipo de cambio a su criterio).
- El sistema no almacena tipos de cambio ni hace conversiones automáticas.
- Justificación: en Argentina el ganado bovino se negocia históricamente en USD. Usar USD como unidad de cuenta permite comparación histórica válida independientemente de la inflación en pesos.

---

## Entidades

### CostoRegistro

Gasto directo asociado a un lote. Puede ser alimentación, un tratamiento sanitario (su costo económico), o cualquier otro costo operativo del lote.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | Sí (auto) | Generado al crear |
| `establecimiento_id` | string | Sí | Establecimiento activo |
| `lote_id` | string | Sí | Lote al que se imputa el costo |
| `categoria` | enum | Sí | `alimentacion`, `sanidad`, `otro` |
| `monto_usd` | number | Sí | Mayor que 0. En USD. |
| `cabezas_al_momento` | integer | Sí (auto) | Cantidad de animales activos en el lote al registrar el costo. Se congela al guardar. |
| `fecha` | date | Sí | Fecha del gasto |
| `descripcion` | string | No | Texto libre. Ej: "silo maíz octubre", "ivermectina lote A" |

> `cabezas_al_momento` se registra automáticamente al guardar el costo. Este valor no cambia aunque el lote cambie después. Permite calcular el costo por cabeza en el momento en que ocurrió el gasto.

---

### CostoEstablecimiento

Gastos generales del establecimiento que no se asocian a un lote específico. Típicamente: mano de obra, mantenimiento de infraestructura, combustible.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | Sí (auto) | |
| `establecimiento_id` | string | Sí | |
| `categoria` | enum | Sí | `mano_de_obra`, `mantenimiento`, `otro` |
| `monto_usd` | number | Sí | Mayor que 0. En USD. |
| `fecha` | date | Sí | Fecha del gasto |
| `descripcion` | string | No | Texto libre |

---

## Precio de compra

El `precio_compra_usd` es un campo opcional del animal que se registra al momento del ingreso (ver `02-animales.md`). Representa el precio por cabeza pagado al ingresar el animal al establecimiento.

- No es una entidad separada: vive directamente en el nodo del animal.
- Si no se registra (campo vacío), el animal tiene `precio_compra_usd: null`.
- Un `precio_compra_usd: null` no impide operar con el animal. Simplemente el P&L del lote lo mostrará con costo de compra = $0 e indicará que el dato falta.
- El campo no puede editarse una vez guardado el ingreso (es parte del evento inmutable de ingreso).

---

## Precio de venta

El precio de venta **no se duplica** en este módulo. Se lee directamente desde el campo `precio_por_cabeza` de la actividad comercial de tipo `venta` (ver `05-actividades-comerciales.md`).

- Solo los animales egresados con una actividad de tipo `venta` tienen precio de venta.
- Los egresados por `despacho`, `muerte` o `transferencia` no tienen precio de venta.

---

## Flujos

### 1. Registrar precio de compra al ingresar un animal

El formulario de ingreso de animal incluye el campo `Precio de compra (USD/cabeza)` como campo opcional.

- El usuario ingresa el precio por cabeza pagado.
- El campo acepta valores decimales (ej: `2.50`, `1250.00`).
- Si el usuario no completa el campo, queda en `null`. No bloquea el guardado.
- En el ingreso RFID grupal, se puede ingresar un precio de compra común para todo el grupo, con posibilidad de sobrescribir por animal.

---

### 2. Registrar costo directo en un lote

Acceso: desde el detalle del lote → sección "Costos" → botón "Agregar costo".

**Flujo:**
1. El usuario selecciona la categoría (`alimentacion`, `sanidad`, `otro`).
2. Ingresa el monto en USD.
3. Ingresa la fecha del gasto.
4. Opcionalmente, agrega una descripción.
5. Al guardar, el sistema registra automáticamente `cabezas_al_momento` con la cantidad de animales activos en el lote en ese instante.
6. El costo queda registrado y aparece en el historial de costos del lote.

**Validaciones:**
- `monto_usd` debe ser mayor que 0.
- No se puede registrar un costo en un lote sin animales (lote vacío). El sistema informa que el lote no tiene animales activos.
- Un lote archivado o eliminado no acepta nuevos costos.

---

### 3. Registrar costo de establecimiento

Acceso: sección financiera del establecimiento → "Costos generales" → "Agregar".

**Flujo:**
1. El usuario selecciona la categoría (`mano_de_obra`, `mantenimiento`, `otro`).
2. Ingresa el monto en USD.
3. Ingresa la fecha del gasto.
4. Opcionalmente, agrega descripción.
5. Guarda el registro.

---

### 4. Ver P&L de un lote

Acceso: desde el detalle del lote → pestaña o sección "Financiero".

El P&L del lote incluye **todos los animales que pasaron por el lote** (actuales y egresados).

**Secciones del P&L:**

#### Ingresos (ventas realizadas)
Suma de `precio_por_cabeza × 1` por cada animal egresado por venta desde este lote.

| Campo | Descripción |
|---|---|
| Animales vendidos | Cantidad de animales egresados por venta |
| Ingreso total | Suma de precios de venta individuales |

#### Inversión en compra
Suma de `precio_compra_usd` de los animales asociados al lote.

| Campo | Descripción |
|---|---|
| Con precio registrado | Cantidad de animales con `precio_compra_usd` definido |
| Sin precio registrado | Cantidad con `precio_compra_usd: null` (advertencia visual) |
| Total invertido en compra | Suma (animales con `null` cuentan como $0) |

#### Costos directos del lote
Suma de todos los `CostoRegistro` del lote, agrupados por categoría.

| Campo | Descripción |
|---|---|
| Alimentación | Suma de registros con `categoria: "alimentacion"` |
| Sanidad | Suma de registros con `categoria: "sanidad"` |
| Otros | Suma de registros con `categoria: "otro"` |
| **Total costos directos** | Suma de las tres categorías |

#### Resultado neto
`Ingresos totales − Inversión en compra − Costos directos del lote`

- Si el resultado es positivo: ganancia.
- Si es negativo: pérdida.
- Si hay animales sin `precio_compra_usd`, se muestra una advertencia: "Resultado estimado — hay animales sin precio de compra registrado".

#### Indicadores por cabeza
Solo se calculan si hay datos suficientes:

| Indicador | Cálculo |
|---|---|
| Costo total por cabeza | `(Inversión en compra + Costos directos) / total de animales del lote` |
| Costo por kg (egresados) | `Costo total por cabeza / peso_egreso` — solo para animales egresados con peso registrado |

#### Stock vivo (referencia)
Animales actualmente activos en el lote, con su costo de compra acumulado. No forma parte del resultado neto (aún no realizados).

| Campo | Descripción |
|---|---|
| Cabezas activas | Cantidad |
| Inversión en stock | Suma de `precio_compra_usd` de animales activos |

#### Costos de establecimiento (referencia)
Los costos de establecimiento **no se incluyen en el resultado neto del lote**. Se muestran como referencia informativa para que el usuario los considere al interpretar el resultado.

---

### 5. Ver resumen financiero del establecimiento

Acceso: sección "Finanzas" del establecimiento activo.

**Vista:**
- Total de costos directos por lote (tabla resumen)
- Total de costos de establecimiento (listado cronológico por categoría)
- Ingresos totales por ventas del período (filtrable por rango de fechas)
- Sin resultado neto global automático (los costos de establecimiento requieren prorrateo manual)

---

## Reglas de negocio

1. **El precio de venta se lee, no se duplica.** El módulo financiero nunca crea un registro de "ingreso por venta" — lee el dato directamente de la actividad comercial.

2. **Los costos de lote son inmutables una vez guardados.** No se pueden editar ni eliminar en MVP. Si el usuario cometió un error, debe registrar un costo negativo como corrección (con descripción "corrección del [fecha]").

3. **Los costos de establecimiento son independientes del P&L por lote.** No se prorratean automáticamente. El usuario los ve en el resumen del establecimiento.

4. **Un animal sin `precio_compra_usd` no bloquea ninguna operación.** Solo afecta la precisión del P&L (se muestra advertencia cuando hay animales sin precio).

5. **Atribución de animales al lote para P&L:** un animal se atribuye al lote para el cálculo del P&L si:
   - Está actualmente activo en el lote, **o**
   - Estaba en el lote al momento de su egreso (el egreso lo sacó directamente del lote).
   - Si un animal fue movido a otro lote antes de egresar, su precio de compra se atribuye al **lote desde el que egresó**, no a lotes anteriores.

6. **Los costos del lote se distribuyen con base en `cabezas_al_momento`.** Este valor se congela al guardar el registro. Si el lote creció o se achicó después, no afecta el costo registrado.

---

## Fuera de alcance (MVP)

- Conversión automática ARS ↔ USD
- Tipo de cambio configurable por período
- Edición o eliminación de costos registrados
- Prorrateo automático de costos de establecimiento a lotes
- Margen por animal individual (el P&L es a nivel lote)
- Proyecciones o presupuesto
- Comparación con precios de mercado
- Facturación o documentos contables
- Integración con sistemas contables externos
- Costo de mano de obra atribuido a actividades específicas
- Registro de costos en activos fijos (maquinaria, infraestructura)
