# Animales

**Dependencias:** Establecimientos (`01-establecimientos.md`)

---

## Entidad: Animal

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Caravana | Texto | Sí | Único dentro del establecimiento. Inmutable una vez asignado. |
| Categoría | Enum | No | Vaca, toro, ternero/a, vaquillona, novillo, toro reproductor, otro |
| Raza | Texto | No | Texto libre en MVP |
| Sexo | Enum | No | Macho, hembra |
| Fecha de nacimiento | Fecha | No | O edad estimada si no se conoce la fecha exacta |
| Peso de ingreso | Número (kg) | No | Peso al momento del ingreso al establecimiento |
| Procedencia | Texto | No | Establecimiento o localidad de origen |
| Fecha de ingreso | Fecha | Sí (automático) | Generada al registrar el ingreso |
| Estado | Enum | Sí (automático) | `activo` o `egresado` |
| Lote actual | Referencia a Lote | No | Puede no tener lote asignado |

---

## Ingreso de animales

### Ingreso individual

- El usuario completa el formulario de ingreso con caravana (obligatoria) y datos opcionales.
- **Validación**: la caravana no puede existir ya en el establecimiento activo (incluyendo animales egresados: una caravana nunca se reutiliza).
- El usuario indica el motivo de ingreso: `compra`, `nacimiento`, `transferencia desde otro establecimiento`.
- Al confirmar, se crea el animal en estado `activo` y se genera el primer evento de trazabilidad: `ingreso`.

### Ingreso masivo

- El usuario puede ingresar un grupo de animales en una sola operación (por ejemplo, al comprar una tropa).
- Se indica una lista de caravanas y los atributos comunes del lote de compra (procedencia, categoría, fecha).
- Cada animal se puede personalizar individualmente si es necesario.
- El sistema valida que ninguna caravana de la lista esté duplicada en el establecimiento o dentro de la misma carga.
- Al confirmar, se crean todos los animales y opcionalmente se los puede asignar directamente a un lote nuevo.

---

## Egreso de animales

### Tipos de egreso

| Tipo | Descripción |
|---|---|
| `venta` | Egreso comercial. Requiere confirmar actividad comercial previa (ver `05-actividades-comerciales.md`). |
| `despacho` | Envío sin precio definido. También requiere actividad comercial. |
| `muerte` | Baja por muerte. No requiere validación de carencia. |
| `transferencia` | Salida hacia otro establecimiento del mismo usuario. |

### Validaciones previas al egreso

- **Para venta y despacho**: el sistema verifica carencia activa. Si el animal tiene carencia activa, el egreso queda bloqueado hasta que venza (o el usuario lo excluya de la operación comercial).
- **Para muerte**: no hay restricciones de carencia. El usuario puede indicar causa de muerte (texto libre, opcional).
- **Para transferencia**: el usuario selecciona el establecimiento destino. El animal se registra como egresado en el origen y se genera un ingreso en el destino.

### Estado post-egreso

- El animal pasa a estado `egresado`.
- No puede ser operado: no recibe actividades, no puede agregarse a lotes, no puede venderse.
- Su perfil es consultable con historial completo, marcado visualmente como inactivo.
- Su caravana queda bloqueada: no puede reutilizarse en ningún animal nuevo del mismo establecimiento.

---

## Estados del animal

| Estado | Descripción | Operaciones disponibles |
|---|---|---|
| `activo` | En el establecimiento, operativo | Todas las operaciones (actividades, lotes, egreso) |
| `egresado` | Ya no está en el establecimiento | Solo consulta (perfil, historial) |

---

## Listado y búsqueda

El listado de animales muestra por defecto los animales `activos` del establecimiento activo.

**Filtros disponibles:**
- Por lote (incluyendo "sin lote asignado")
- Por categoría
- Por estado (`activo` / `egresado`)
- Por carencia activa (sí/no)

**Búsqueda:**
- Por número de caravana (coincidencia parcial o exacta)
- Por nombre/alias (si se registró)

**Ordenamiento:**
- Por fecha de ingreso (más reciente primero, por defecto)
- Por caravana (alfabético)
- Por categoría

---

## Perfil individual del animal

La vista de detalle de un animal concentra toda su información:

- **Datos base**: caravana, categoría, raza, sexo, fecha de nacimiento, peso de ingreso, procedencia, fecha de ingreso.
- **Estado actual**: activo / egresado (con fecha y tipo de egreso si aplica).
- **Lote actual**: nombre del lote al que pertenece (o "sin lote"). Acceso directo al detalle del lote.
- **Carencia activa**: si aplica, muestra el producto, la fecha de vencimiento y los días restantes. Indicador visual destacado.
- **Historial de actividades**: resumen de últimas actividades con acceso al historial completo (ver `06-trazabilidad.md`).
- **Alertas activas**: alertas vigentes sobre este animal.

---

## Fuera de alcance (MVP)

- Múltiples identificadores por animal (chip electrónico, QR, tatuaje)
- Foto del animal
- Peso histórico (solo se registra peso de ingreso; el pesaje periódico es una extensión futura)
- Genealogía / trazabilidad reproductiva
- Importación desde planilla CSV
