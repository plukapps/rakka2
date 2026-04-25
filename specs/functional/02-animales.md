# Animales

**Dependencias:** Establecimientos (`01-establecimientos.md`)

---

## Entidad: Animal

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Caravana | Texto (15 dígitos) | Sí | Único dentro del establecimiento. Inmutable una vez asignado. Formato: `CCCFFFSSSSSNNNN` donde CCC = código de país (3 dígitos), FFF = fijos en cero (3 dígitos), SSSSS = serie (5 dígitos), NNNN = número de caravana (4 dígitos). Ejemplo: `858000123456789` (858 = Uruguay). |
| Categoría | Enum | No | Vaca, toro, ternero/a, vaquillona, novillo, toro reproductor, otro |
| Raza | Texto | No | Texto libre en MVP |
| Sexo | Enum | No | Macho, hembra |
| Fecha de nacimiento | Fecha | No | O edad estimada si no se conoce la fecha exacta |
| Peso de ingreso | Número (kg) | No | Peso al momento del ingreso al establecimiento |
| Procedencia | Texto | No | Establecimiento o localidad de origen |
| Fecha de ingreso | Fecha | Sí (automático) | Generada al registrar el ingreso |
| Estado | Enum | Sí (automático) | `activo` o `egresado` |
| Lote actual | Referencia a Lote | No | Puede no tener lote asignado |
| Precio de compra | Número (USD/cabeza) | No | Precio pagado por cabeza al ingresar. En USD. Inmutable una vez guardado. |

---

## Ingreso de animales

El sistema ofrece dos métodos de ingreso. El usuario elige el método al iniciar el flujo de ingreso.

### Ingreso individual

- El usuario completa el formulario de ingreso con caravana (obligatoria) y datos opcionales.
- **Validación**: la caravana no puede existir ya en el establecimiento activo (incluyendo animales egresados: una caravana nunca se reutiliza).
- El usuario indica el motivo de ingreso: `compra`, `nacimiento`, `transferencia desde otro establecimiento`.
- El usuario puede registrar opcionalmente el precio de compra en USD por cabeza. Solo aplica cuando el motivo es `compra`. Si el motivo es `nacimiento` o `transferencia`, el campo no aparece.
- Al confirmar, se crea el animal en estado `activo` y se genera el primer evento de trazabilidad: `ingreso`.

### Ingreso desde lectura RFID

Permite registrar como stock un grupo de animales a partir de una actividad de lectura RFID (`type: "reading"`) ya registrada en el sistema.

**Flujo:**
1. El usuario selecciona una actividad de tipo `reading` registrada previamente.
2. El sistema muestra únicamente las caravanas **desconocidas** (`unknownCaravanas`) de esa actividad (las reconocidas ya están en el sistema).
3. El usuario completa los **atributos comunes** del grupo: tipo de ingreso, fecha, procedencia, categoría, raza (todos opcionales excepto tipo y fecha). Estos valores se aplican a todos los animales.
4. El usuario puede ingresar un precio de compra en USD común para todo el grupo (opcional). Si aplica, puede sobrescribir por animal.
5. Si algún animal difiere del grupo, el usuario puede sobrescribir sus atributos individualmente.
6. El usuario puede excluir caravanas de la lista antes de confirmar.
7. Opcionalmente, puede asignar todos los animales ingresados a un lote (nuevo o existente).
8. Al confirmar, se crean todos los animales en estado `activo` y se genera el evento de trazabilidad `ingreso` para cada uno.

**Validaciones:**
- Las caravanas no pueden existir ya en el establecimiento (misma regla que el ingreso individual).
- Si alguna caravana ya existe en el establecimiento, se marca con error individual y se excluye automáticamente del ingreso; el resto se procesa normalmente.
- La actividad de lectura seleccionada debe pertenecer al establecimiento activo.

---

## Egreso de animales

### Tipos de egreso

| Tipo | Descripción |
|---|---|
| `venta` | Egreso comercial. Requiere confirmar actividad comercial previa (ver `05-actividades-comerciales.md`). |
| `despacho` | Envío sin precio definido. También requiere actividad comercial. |
| `muerte` | Baja por fallecimiento. Acción dedicada "Dar de baja". No requiere validación de carencia. |
| `transferencia` | Salida hacia otro establecimiento del mismo usuario. |

### Dar de baja (muerte)

El flujo "Dar de baja" es la acción específica para registrar la muerte de un animal. Se accede desde el menú "..." en el encabezado del detalle del animal (solo disponible para animales activos).

**Campos:**
- Fecha de fallecimiento * (obligatorio, default: hoy)
- Causa del fallecimiento (texto libre, opcional)

**Al confirmar:**
- El animal pasa a `egresado` con `exitType: "death"`, `exitDate` y `exitNotes` (causa).
- Si el animal estaba en un lote, se elimina de él (`lotId: null`, `animalCount` decrementado).
- Se genera un evento de trazabilidad de tipo `exit`.
- No hay validación de carencia.

**Restricciones:**
- Acción irreversible.
- Solo disponible para animales en estado `activo`.

### Validaciones previas al egreso

- **Para venta y despacho**: el sistema verifica carencia activa. Si el animal tiene carencia activa, el egreso queda bloqueado hasta que venza (o el usuario lo excluya de la operación comercial).
- **Para muerte**: no hay restricciones de carencia. El usuario puede indicar causa de muerte (texto libre, opcional).
- **Para transferencia**: el usuario selecciona el establecimiento destino. El animal se registra como egresado en el origen y se genera un ingreso en el destino.

### Estado post-egreso

- El animal pasa a estado `egresado`.
- No puede ser operado: no recibe actividades, no puede agregarse a lotes, no puede venderse.
- Su perfil es consultable con historial completo.
- Su caravana queda bloqueada: no puede reutilizarse en ningún animal nuevo del mismo establecimiento.
- **Distinción visual**: animales con `exitType: "death"` se muestran con badge "Inactivo". Animales egresados por venta, despacho o transferencia se muestran con badge "Egresado".

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
- **Estado actual**: activo / egresado (con fecha y tipo de egreso si aplica). Si `exitType: "death"`, muestra "Fecha de baja" y "Causa" (si fue registrada).
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
