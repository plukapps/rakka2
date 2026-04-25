# Actividades Comerciales

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`), Actividades sanitarias (`04-actividades-sanitarias.md`)

> La selección de animales (RFID, archivo, lote, individual) sigue el mecanismo común definido en `04-actividades-framework.md`. Este archivo documenta solo los atributos y reglas específicos del tipo comercial.

---

## Tipos de actividad comercial

| Tipo | Descripción |
|---|---|
| `venta` | Egreso comercial con precio acordado. El comprador adquiere los animales. |
| `despacho` | Envío de animales a un destino sin precio definido en el momento (ej: consignación, feria). |

---

## Atributos del registro comercial

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Tipo | Enum | Sí | `venta` o `despacho` |
| Comprador / Destinatario | Texto libre | No para despacho, Sí para venta | Nombre de la persona o empresa |
| Destino | Texto libre | No | Localidad, frigorífico, feria, etc. |
| Precio por cabeza | Número (USD) | No | Precio individual en USD. El módulo financiero (`15-modulo-financiero.md`) lo usa para calcular ingresos en el P&L del lote. |
| Precio total | Número (USD) | No | Calculado automáticamente si se ingresa precio por cabeza, o ingresado directamente. |
| Fecha de la operación | Fecha | Sí | Por defecto: fecha actual |
| Observaciones | Texto libre | No | Notas adicionales sobre la operación |

---

## Selección de animales

El usuario puede construir el grupo de animales para una operación comercial de dos maneras:

### Desde un lote

1. El usuario selecciona un lote como punto de partida.
2. El sistema carga todos los animales activos del lote.
3. El usuario puede **deseleccionar** animales individuales que no participan en la operación.
4. El sistema marca automáticamente con alerta los animales con carencia activa (ver validación abajo).

### Selección individual

1. El usuario agrega animales uno a uno buscando por caravana o navegando el listado.
2. Puede mezclar animales de distintos lotes o sin lote.

En ambos casos, el usuario ve la lista de animales confirmados para la operación antes de proceder.

---

## Validación de carencia

Antes de confirmar la operación, el sistema verifica si algún animal seleccionado tiene **carencia activa**.

**Comportamiento:**
- El sistema muestra el listado de animales con carencia activa, indicando para cada uno: el producto que genera la carencia, la fecha de vencimiento y los días restantes.
- La operación **no puede confirmarse** mientras haya animales con carencia activa en la selección.
- El usuario tiene dos opciones:
  1. **Remover** los animales con carencia de la selección y continuar con el resto.
  2. **Cancelar** la operación y esperar a que venzan las carencias.
- El bloqueo es **por animal**: si se remueven todos los animales con carencia, la operación puede confirmarse con los restantes.

---

## Confirmación y egreso

Al confirmar la operación comercial:

1. Se crea el registro de actividad comercial con todos sus atributos.
2. Por cada animal incluido en la operación:
   - Se registra un evento de egreso de tipo `venta` o `despacho`.
   - El animal pasa a estado `egresado`.
   - Se genera un evento de trazabilidad: `egreso comercial`, vinculado al registro de la actividad comercial.
   - El animal se desvincula automáticamente de su lote (si tenía uno).

---

## Historial comercial

El establecimiento mantiene un registro de todas las operaciones comerciales realizadas.

**Vista del listado:**
- Fecha de operación
- Tipo (venta / despacho)
- Comprador / destinatario
- Cantidad de animales
- Precio total (si se registró)

**Filtros:**
- Por tipo de operación
- Por rango de fechas
- Por comprador / destinatario (texto)

**Detalle de una operación:**
- Todos los atributos del registro.
- Lista de animales involucrados con sus caravanas y categorías.
- Acceso al perfil de cada animal desde el detalle.

---

## Fuera de alcance (MVP)

- Facturación o generación de documentos comerciales
- Integración con sistemas contables
- Registro de remitos o guías de traslado
- Historial de precios de mercado o referencia de precios
- Flujo de compra estructurado como actividad: el precio de compra se registra en el formulario de ingreso del animal (ver `02-animales.md`), no como actividad comercial
