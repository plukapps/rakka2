# Offline y Sincronización

**Dependencias:** Todos los módulos

---

## Principio offline-first

La app está diseñada para operar en campo, donde la conectividad es intermitente o inexistente. El principio es:

> El usuario puede realizar cualquier operación de registro sin conexión. La app no degrada su funcionalidad en ausencia de internet. La sincronización es un proceso posterior, transparente y automático.

El usuario no necesita pensar en si tiene o no conexión: simplemente usa la app. El sistema se encarga de sincronizar cuando la red esté disponible.

---

## Operaciones disponibles sin conexión

### Disponible offline (completo)

- Registrar actividades sanitarias (sobre animal o lote)
- Ingresar animales
- Registrar egresos (venta, despacho, muerte, transferencia)
- Confirmar operaciones comerciales
- Crear y modificar lotes
- Agregar/mover animales entre lotes
- Consultar historial de animales (datos descargados previamente)
- Ver alertas y dashboard (datos de la última sincronización)
- Búsqueda de animales y lotes (datos locales)
- Crear y editar establecimientos

### No disponible offline

- Cambiar al establecimiento activo si sus datos **nunca fueron descargados** en este dispositivo.
- Operaciones que requieran verificar datos en tiempo real contra el servidor (ninguna en el MVP: todo se valida contra datos locales).

---

## Descarga inicial de datos

Al seleccionar un establecimiento como activo por primera vez en un dispositivo:

1. La app descarga todos los datos del establecimiento (animales, lotes, actividades, alertas).
2. Mientras se descarga, la app muestra un indicador de carga.
3. Una vez descargado, el establecimiento está disponible para uso offline.

En visitas posteriores, el establecimiento activo está disponible aunque no haya conexión.

---

## Cola de operaciones pendientes

Cuando el usuario registra una operación sin conexión, esta se almacena en una **cola local** hasta poder sincronizarse.

### Atributos de una operación en cola

| Atributo | Descripción |
|---|---|
| Tipo | Qué tipo de operación es (ingreso animal, actividad sanitaria, etc.) |
| Datos | Contenido completo de la operación |
| Timestamp local | Fecha y hora en que el usuario registró la operación en el dispositivo |
| Estado | `pendiente`, `sincronizando`, `sincronizado`, `error` |

### Comportamiento de la cola

- Las operaciones se aplican localmente de inmediato: el usuario ve los cambios en la app sin esperar a sincronizar.
- La cola se procesa en orden cronológico (por timestamp local).
- Si hay operaciones de múltiples establecimientos en cola, se procesan establecimiento por establecimiento.

---

## Sincronización

### Cuándo se dispara

1. **Automáticamente**: cuando el dispositivo recupera conexión a internet.
2. **Manualmente**: el usuario puede forzar una sincronización desde la configuración o desde el indicador de estado.

### Proceso de sincronización

1. El sistema envía las operaciones pendientes al servidor en orden cronológico.
2. El servidor confirma cada operación.
3. El sistema descarga los cambios remotos que otros dispositivos hayan sincronizado.
4. El estado local se actualiza con los datos más recientes del servidor.

### Indicadores durante la sincronización

- El usuario ve en todo momento el estado de sincronización:
  - **Sin conexión**: ícono o banner que indica modo offline.
  - **Sincronizando**: animación o indicador de progreso.
  - **Todo sincronizado**: estado limpio, sin indicadores pendientes.
  - **Error de sincronización**: indicador rojo o banner con descripción del problema.
- Si hay operaciones pendientes, se muestra el conteo: "N operaciones pendientes de sincronizar".

---

## Resolución de conflictos

Un conflicto ocurre cuando dos dispositivos registraron operaciones sobre el mismo animal o entidad mientras ambos estaban offline, y esas operaciones son incompatibles.

### Regla general

Las operaciones se aplican en **orden cronológico por timestamp local**. La última operación en el tiempo prevalece.

### Conflicto irresolvible

Ejemplo: el animal con caravana #1234 fue marcado como vendido desde el dispositivo A y como muerto desde el dispositivo B, ambos sin conexión.

En este caso:
1. El servidor detecta el conflicto al recibir ambas operaciones.
2. Aplica la que tiene timestamp más reciente.
3. Genera una **notificación de conflicto** para el usuario: describe las dos operaciones, cuál fue aplicada y cuál fue descartada.
4. El usuario puede revisar el conflicto y registrar una corrección manual si es necesario (ver `06-trazabilidad.md`, sección de correcciones).

---

## Fuera de alcance (MVP)

- Sincronización selectiva por módulo o por animal
- Sincronización en background en iOS (sujeto a restricciones del sistema operativo)
- Modo multi-usuario colaborativo en tiempo real
- Historial de operaciones sincronizadas (log de sync)
- Resolución de conflictos asistida con interfaz de merge
