# Overview — App de Gestión Ganadera

## Propósito del producto

App móvil de gestión ganadera para productores rurales y veterinarios. Permite registrar y consultar todo lo que ocurre con los animales de un establecimiento: ingresos, egresos, actividades sanitarias, ventas y movimientos entre lotes.

El foco está en la operación en campo: la app debe funcionar sin conexión, ser rápida de usar, y transformar los registros del día a día en trazabilidad, alertas y reportes útiles.

---

## Usuarios

En esta fase existe un único rol: **usuario con acceso completo**.

Un usuario puede crear y gestionar múltiples establecimientos. Dentro de cada establecimiento, tiene acceso irrestricto a todos los módulos: animales, lotes, actividades, comercial, reportes.

> Nota: La diferenciación de roles (productor, veterinario, administrador de empresa) es una extensión prevista para fases posteriores.

---

## Glosario de dominio

| Término | Definición |
|---|---|
| **Establecimiento** | Campo o unidad productiva ganadera administrada por el usuario. Un usuario puede tener varios. Todo lo demás (animales, lotes, actividades) pertenece a un establecimiento. |
| **Animal** | Individuo bovino registrado en el sistema. Siempre identificado por una caravana única. |
| **Caravana** | Identificador físico del animal (tag auricular). Es el identificador principal en el sistema: obligatorio, único dentro del establecimiento e inmutable una vez asignado. |
| **Lote** | Agrupación operativa y dinámica de animales. Se usa para ejecutar actividades sobre un conjunto de animales a la vez. Un animal puede pertenecer a un solo lote o a ninguno. |
| **Actividad** | Evento registrado sobre un animal o lote. Tipos: lectura RFID, sanitaria, comercial, control de campo, movimiento, reproducción, general. |
| **Actividad sanitaria** | Vacuna o tratamiento aplicado a uno o más animales. Incluye datos de producto, dosis, vía, carencia y responsable. |
| **Actividad comercial** | Venta o despacho de animales. Incluye comprador, destino, precio y genera el egreso de los animales involucrados. |
| **Carencia** | Período de espera obligatorio después de aplicar un producto sanitario, durante el cual el animal no puede ser enviado a faena ni vendido. Se expresa en días. |
| **Carencia activa** | Estado de un animal cuando la fecha actual es anterior al vencimiento de su carencia más reciente. Bloquea las actividades comerciales. |
| **Ingreso** | Evento que incorpora un animal al establecimiento. Tipos: compra, nacimiento, transferencia desde otro establecimiento. |
| **Egreso** | Evento que retira un animal del establecimiento. Tipos: venta, despacho, muerte, transferencia a otro establecimiento. Un animal egresado no puede ser operado, pero su historial es consultable. |
| **Trazabilidad** | Línea de vida completa de un animal: secuencia cronológica de todos los eventos registrados desde su ingreso hasta su egreso (o hasta el momento actual). |
| **Alerta** | Notificación generada por el sistema ante una condición de negocio que requiere atención: carencia próxima a vencer, animal bloqueado para venta, etc. |
| **Establecimiento activo** | El establecimiento seleccionado por el usuario como contexto de trabajo. Toda la pantalla opera sobre este establecimiento hasta que el usuario cambie. |

---

## Mapa de dominios

```
Usuario
└── tiene muchos → Establecimientos
    └── cada uno contiene:
        ├── Animales (identificados por caravana)
        │   ├── pertenecen a → Lote (opcional, uno a la vez)
        │   ├── tienen → Actividades sanitarias
        │   ├── participan en → Actividades comerciales
        │   └── tienen → Línea de trazabilidad (todos los eventos)
        └── Lotes (agrupaciones dinámicas de animales)
            └── sobre los que se ejecutan → Actividades (se aplican a cada animal del lote)
```

**Relaciones clave:**
- Un animal siempre pertenece a un establecimiento.
- Un animal puede estar en ningún lote o en un lote a la vez.
- Las actividades sobre un lote generan registros individuales por animal.
- La trazabilidad consolida todos los eventos de un animal, independientemente del módulo que los originó.
- La carencia de una actividad sanitaria bloquea las actividades comerciales futuras.

---

## Restricciones funcionales globales

Estas reglas aplican en toda la aplicación, sin excepción:

1. **Toda operación queda registrada** con fecha, tipo y usuario que la ejecutó. Los eventos son la fuente de verdad.
2. **La caravana es el identificador primario del animal**: es obligatoria, única dentro del establecimiento, e inmutable una vez asignada. No puede modificarse ni reutilizarse (incluso si el animal es egresado).
3. **No se puede operar sobre un animal egresado**: un animal que registró un egreso queda en estado inactivo. Solo es consultable (historial, perfil).
4. **Los eventos no se eliminan**: el historial es inmutable. Si se cometió un error, se registra un evento de corrección; el original permanece.
5. **La carencia bloquea ventas**: ninguna actividad comercial puede confirmar el egreso de un animal con carencia activa. El bloqueo es por animal, no por operación completa.
6. **El contexto siempre es el establecimiento activo**: toda operación de creación, listado y consulta ocurre dentro del establecimiento que el usuario tiene seleccionado.

---

## Alcance del MVP

**Dentro del MVP:**
- Gestión de establecimientos (múltiples por usuario)
- Ingreso y egreso de animales con caravana obligatoria
- Lotes dinámicos
- Actividades sanitarias (vacunas y tratamientos) sobre animales y lotes
- Actividades comerciales (ventas y despachos) con validación de carencia
- Trazabilidad por animal
- Dashboard y alertas del establecimiento activo
- Home orientada a gestión
- Operación offline-first con sincronización

**Explícitamente fuera del MVP:**
- Diferenciación de roles y permisos
- Integración con SENASA u organismos regulatorios
- Vista agregada multi-establecimiento (dashboard global)
- Importación/exportación masiva de datos
- Geolocalización de eventos
- Mapas y trazabilidad geográfica
- Reportes avanzados e imprimibles
- Soporte para especies distintas a bovinos
