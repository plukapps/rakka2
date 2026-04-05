# Actividades — Framework General

**Dependencias:** Animales (`02-animales.md`), Lotes (`03-lotes.md`)

---

## Concepto

Una **actividad** es cualquier evento operativo registrado sobre uno o más animales. Todas las actividades comparten la misma mecánica de selección de animales y quedan registradas en la trazabilidad de cada animal involucrado.

---

## Tipos de actividad

| Tipo | Descripción | Spec de detalle |
|---|---|---|
| `reading` | Lectura RFID (Bluetooth o archivo) | `14-actividades-lectura.md` |
| `sanitary` | Vacuna o tratamiento con carencia | `04-actividades-sanitarias.md` |
| `commercial` | Venta o despacho de animales | `05-actividades-comerciales.md` |
| `field_control` | Pesaje, conteo, revisión reproductiva, ecografía | `10-actividades-campo.md` |
| `movement` | Traslado entre potreros, corrales o campos | `11-actividades-movimientos.md` |
| `reproduction` | Servicio, tacto, preñez, parto, destete | `12-actividades-reproduccion.md` |
| `general` | Nota o evento libre definido por el usuario | `13-actividades-general.md` |

El sistema está diseñado para incorporar nuevos tipos sin cambiar la mecánica de selección.

---

## Selección de animales

Todas las actividades (sin excepción) requieren definir el conjunto de animales sobre los que aplican. Existen cuatro mecanismos de selección:

### 1. Lectura RFID en tiempo real (Bluetooth)

El operador conecta un lector RFID por Bluetooth al dispositivo. Las caravanas electrónicas se leen y aparecen en pantalla en tiempo real a medida que el lector las detecta.

- El usuario puede ver qué animales ya fueron leídos y cuáles faltan.
- Si una caravana leída no existe en el establecimiento activo, se marca como "desconocida" (alerta).
- El usuario puede pausar la lectura, agregar manualmente, o remover animales de la lista.
- Al finalizar la lectura, el conjunto resultante es la selección para la actividad.

### 2. Carga de archivo de lectura RFID

El operador usó el lector portátil en el campo previamente y generó un archivo de lectura. Lo sube a la app.

- **Formato del archivo**: cada línea tiene el formato `[|A0000000858000054596559|15082023|113716|T33333|.|...|]`. Los campos están separados por `|`. Del primer campo se extraen los **últimos 15 dígitos**, que corresponden a la caravana completa (ej: `858000054596559`).
- **Formatos soportados**: `.txt` y `.csv`.
- La lectura siempre es exitosa: **todas las caravanas leídas se registran**, independientemente de si existen en el establecimiento.
- El sistema clasifica las caravanas en dos grupos:
  - **En stock**: caravanas que coinciden con animales activos del establecimiento.
  - **Sin registro**: caravanas que no existen en el establecimiento (pueden ser de otro campo, animales no ingresados, muertos, etc.).
- Las caravanas sin registro no bloquean la lectura — se almacenan como `unknownCaravanas` en la lectura.
- El usuario puede revisar ambos grupos antes de confirmar.

### 3. Selección por lote

El usuario selecciona un lote. Todos los animales activos del lote en ese momento conforman la selección inicial. Menos común que RFID, pero disponible.

- El usuario puede deseleccionar animales individuales del lote antes de confirmar.

### 4. Selección individual

El usuario agrega animales uno a uno buscando por caravana o navegando el listado.

---

## Flujo general de registro de actividad

```
1. Usuario selecciona el tipo de actividad
2. Usuario elige el mecanismo de selección de animales:
   a. RFID Bluetooth → conectar lector → leer → revisar lista
   b. Cargar archivo RFID → parsear → revisar lista
   c. Seleccionar lote → lista pre-cargada → ajustar
   d. Búsqueda individual → agregar uno a uno
3. Usuario ve la lista final de animales seleccionados
4. Usuario completa los atributos específicos del tipo de actividad
5. Si hay validaciones (ej: carencia en actividades comerciales), el sistema las ejecuta aquí
6. Usuario confirma
7. Se crea la actividad con un registro por cada animal
8. Se genera un evento de trazabilidad por cada animal
```

---

## Atributos comunes a todas las actividades

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Tipo | Enum | Sí | Ver tabla de tipos |
| Animal(s) | Lista de referencias | Sí | Mínimo 1 animal (excepción: `reading` permite 0) |
| Método de selección | Enum | Sí (automático) | `rfid_bluetooth`, `rfid_file`, `lot`, `individual` |
| Fecha | Fecha/hora | Sí | Por defecto: ahora |
| Responsable | Texto | No | Quién ejecutó la actividad |
| Observaciones | Texto | No | Notas libres |
| Caravanas desconocidas | Lista de textos | No | Caravanas leídas por RFID que no existen en el establecimiento. Solo cuando selectionMethod es `rfid_bluetooth` o `rfid_file` |
| Nombre del archivo | Texto | No | Solo cuando selectionMethod es `rfid_file` |

---

## Nota sobre actividades tipo `reading`

La actividad de tipo `reading` es un caso especial:
- Siempre usa selección RFID (Bluetooth o archivo). No admite selección por lote ni individual.
- Puede tener 0 animales reconocidos (solo caravanas desconocidas) y sigue siendo válida.
- Su propósito es registrar una lectura de caravanas como conteo, verificación de stock, o paso previo al ingreso de nuevos animales.
- El detalle de una lectura muestra las caravanas en grilla con tabs: Todas / En stock / Sin registro. Las caravanas en stock son clickeables → perfil del animal. Las desconocidas se muestran con indicador amber.

Ver detalle completo en `14-actividades-lectura.md`.

---

## Fuera de alcance (MVP)

- Integración con lectores RFID específicos por marca/modelo
- Lectura RFID por NFC desde el propio teléfono
- Actividades programadas o recurrentes
- Actividades que aplican al establecimiento completo (sin selección de animales)
