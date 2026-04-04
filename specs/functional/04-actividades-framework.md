# Actividades — Framework General

**Dependencias:** Animales (`02-animales.md`), Lotes (`03-lotes.md`)

---

## Concepto

Una **actividad** es cualquier evento operativo registrado sobre uno o más animales. Todas las actividades comparten la misma mecánica de selección de animales y quedan registradas en la trazabilidad de cada animal involucrado.

---

## Tipos de actividad

| Tipo | Descripción | Spec de detalle |
|---|---|---|
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

- **Formatos soportados**: `.txt` y `.csv` (una caravana por línea, sin encabezado o con encabezado ignorado).
- El sistema parsea el archivo, cruza las caravanas con el establecimiento activo y presenta el resultado.
- Las caravanas no reconocidas se marcan como "desconocidas" con advertencia.
- El usuario puede revisar y editar la selección antes de continuar.

### 3. Selección por lote

El usuario selecciona un lote. Todos los animales activos del lote en ese momento conforman la selección inicial. Menos común que RFID, pero disponible.

- El usuario puede deseleccionar animales individuales del lote antes de confirmar.

### 4. Selección individual

El usuario agrega animales uno a uno buscando por caravana o navegando el listado.

---

## Lectura RFID como evento de trazabilidad

**Toda lectura RFID queda registrada como un evento de trazabilidad independiente**, independientemente de si se usó para una actividad posterior o fue una lectura de conteo/verificación sin actividad asociada.

### Atributos del evento de lectura RFID

| Atributo | Descripción |
|---|---|
| Tipo de evento | `rfid_reading` |
| Método | `bluetooth` o `file_upload` |
| Timestamp | Fecha y hora de la lectura |
| Responsable | Usuario que realizó la lectura |
| Actividad asociada | Referencia a la actividad que usó esta lectura (puede ser `null`) |
| Observaciones | Notas opcionales |

Una lectura RFID puede estar:
- **Asociada a una actividad**: la lectura se hizo como paso de selección de animales para registrar una actividad
- **Independiente**: la lectura fue un conteo o verificación sin actividad asociada (el operador elige "solo registrar lectura")

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
9. Si la selección fue por RFID, se registra también el evento de lectura RFID
```

---

## Atributos comunes a todas las actividades

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Tipo | Enum | Sí | Ver tabla de tipos |
| Animal(s) | Lista de referencias | Sí | Mínimo 1 animal |
| Método de selección | Enum | Sí (automático) | `rfid_bluetooth`, `rfid_file`, `lot`, `individual` |
| Fecha | Fecha/hora | Sí | Por defecto: ahora |
| Responsable | Texto | No | Quién ejecutó la actividad |
| Observaciones | Texto | No | Notas libres |
| RFID Reading ID | Referencia | No | Si la selección fue por RFID |

---

## Fuera de alcance (MVP)

- Integración con lectores RFID específicos por marca/modelo
- Lectura RFID por NFC desde el propio teléfono
- Actividades programadas o recurrentes
- Actividades que aplican al establecimiento completo (sin selección de animales)
