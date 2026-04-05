# Actividades — Lectura RFID

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`)

---

## Concepto

La **lectura RFID** es un tipo de actividad (`type: "reading"`) que registra la captura de caravanas electrónicas mediante un lector RFID (Bluetooth en tiempo real) o la carga de un archivo previamente grabado por el lector portátil.

A diferencia de otros tipos de actividad, la lectura no requiere una acción adicional sobre los animales: el objetivo es registrar qué caravanas fueron detectadas, cuáles corresponden a animales en stock y cuáles son desconocidas.

---

## Métodos de lectura

### Bluetooth (tiempo real)

El operador conecta un lector RFID por Bluetooth. Las caravanas aparecen en pantalla a medida que son detectadas.

- Indicador de estado: desconectado / conectado / leyendo.
- Las caravanas se clasifican en tiempo real: **en stock** (animal activo en el establecimiento) o **desconocida** (no encontrada).
- Duplicados se ignoran automáticamente.
- El usuario puede pausar/reanudar la lectura.
- Al finalizar, el conjunto de caravanas se convierte en la actividad.

### Archivo (carga de archivo previo)

El operador usó el lector portátil en el campo y carga el archivo resultante.

- **Formatos soportados**: `.txt` y `.csv`.
- **Formato del archivo**: cada línea tiene el formato `[|A0000000858000054596559|15082023|113716|T33333|.|...|]`. Los campos están separados por `|`. Del primer campo se extraen los **últimos 15 dígitos**, que corresponden a la caravana completa.
- Al cargar, el sistema clasifica las caravanas:
  - **En stock**: coinciden con animales activos del establecimiento → se almacenan como `animalIds`.
  - **Sin registro**: no existen en el establecimiento → se almacenan como `unknownCaravanas`.
- La lectura siempre es exitosa: todas las caravanas se registran, las desconocidas no bloquean la operación.
- El nombre del archivo se almacena en el campo `fileName`.

---

## Diferencias con otros tipos de actividad

| Aspecto | Otros tipos | `reading` |
|---|---|---|
| Selección de animales | 4 métodos (RFID BT, archivo, lote, individual) | Solo RFID (Bluetooth o archivo) |
| Mínimo de animales | 1 | 0 (puede tener solo caravanas desconocidas) |
| Acción sobre el animal | Sí (tratamiento, venta, pesaje, etc.) | No — solo registrar la detección |
| Campos específicos | Según tipo/subtipo | Ninguno adicional (los datos RFID están en los campos comunes) |

---

## Atributos específicos

La actividad tipo `reading` no tiene campos adicionales propios. Toda su información se almacena en los campos comunes del framework:

- `selectionMethod`: `rfid_bluetooth` o `rfid_file` (obligatorio, siempre uno de estos dos)
- `animalIds`: animales reconocidos en el establecimiento (puede estar vacío)
- `unknownCaravanas`: caravanas no encontradas (lista de strings de 15 dígitos)
- `fileName`: nombre del archivo cargado (solo si `selectionMethod` es `rfid_file`)
- `activityDate`, `responsible`, `notes`: campos comunes

---

## Usos de una lectura registrada

### 1. Conteo / verificación de stock

El operador lee las caravanas en un potrero para verificar cuántos animales hay y si coinciden con el registro del sistema. La comparación en stock vs. desconocidas da el resultado.

### 2. Paso previo al ingreso de animales

Las caravanas desconocidas de una lectura pueden usarse para dar de alta animales nuevos mediante el flujo "Ingreso desde lectura RFID" (ver `02-animales.md`). En ese flujo, el usuario selecciona una actividad tipo `reading` y el sistema muestra las caravanas desconocidas como candidatas para ingreso.

### 3. Registro de auditoría

Toda lectura queda en el historial de actividades del establecimiento como evidencia de que se realizó un control.

---

## Visualización en detalle

El detalle de una actividad tipo `reading` muestra:

- **Metadatos**: método (Bluetooth / Archivo), nombre del archivo (si aplica), fecha, responsable, notas.
- **Grilla de caravanas** con tabs:
  - **Todas**: total de caravanas leídas (reconocidas + desconocidas).
  - **En stock**: caravanas reconocidas. Cada una muestra `TagView` + categoría + lote. Clickeable → perfil del animal.
  - **Sin registro**: caravanas desconocidas. Se muestran con `TagView` en indicador amber. No clickeables.
- Contador total en el header: "N caravanas leídas".

---

## Evento de trazabilidad

Cuando se registra una lectura, se genera un evento de trazabilidad `reading` para cada animal reconocido (`animalIds`). Las caravanas desconocidas no generan eventos de trazabilidad (no hay animal al cual asociarlos).

---

## Fuera de alcance (MVP)

- Integración con lectores RFID específicos por marca/modelo
- Lectura RFID por NFC desde el propio teléfono
- Comparación automática entre lecturas sucesivas (delta de stock)
