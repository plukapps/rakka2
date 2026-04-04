# Alertas y Dashboard

**Dependencias:** Todos los módulos anteriores

---

## Dashboard del establecimiento

El dashboard presenta un resumen del estado actual del establecimiento activo. Es la vista de "salud operativa" del campo.

### Métricas del resumen

| Métrica | Descripción |
|---|---|
| Animales activos (total) | Cantidad total de animales en estado `activo` |
| Distribución por categoría | Cantidad por cada categoría (vaca, toro, ternero, etc.) |
| Lotes activos | Cantidad de lotes en estado `activo` |
| Con carencia activa | Cantidad de animales que actualmente tienen carencia activa |
| Actividades recientes | Cantidad de actividades registradas en los últimos 7 días |

Las métricas son del establecimiento activo. No hay vista agregada de múltiples establecimientos en el MVP.

---

## Sistema de alertas

Una **alerta** es una notificación generada por el sistema cuando detecta una condición de negocio que el usuario debe atender.

### Atributos de una alerta

| Atributo | Descripción |
|---|---|
| Tipo | Categoría de la alerta (ver tipos abajo) |
| Descripción | Texto explicativo de la condición |
| Animal o lote afectado | Referencia al animal o lote que origina la alerta |
| Fecha relevante | Fecha de vencimiento, fecha del evento, etc. |
| Urgencia | `informativa`, `advertencia`, `crítica` |
| Estado | `activa`, `resuelta`, `desestimada` |

### Tipos de alerta en el MVP

#### 1. Carencia próxima a vencer

- **Condición**: un animal tiene carencia activa y su vencimiento ocurrirá dentro de los próximos N días.
- **N configurable**: por defecto 7 días. El usuario puede ajustar este umbral en la configuración del establecimiento.
- **Urgencia**:
  - `advertencia` si faltan más de 3 días
  - `crítica` si faltan 3 días o menos
- **Resolución automática**: cuando la carencia vence, la alerta se resuelve sola.
- **Información que muestra**: nombre/caravana del animal, producto que genera la carencia, fecha de vencimiento, días restantes.

#### 2. Animal bloqueado para venta por carencia activa

- **Condición**: el usuario intenta iniciar una operación comercial con un animal que tiene carencia activa.
- **Esta alerta se activa en el flujo de actividades comerciales**, no de forma autónoma en el dashboard. El dashboard puede mostrar el conteo de animales con carencia activa como métrica de resumen.
- Ver bloqueo detallado en `05-actividades-comerciales.md`.

#### 3. Sugerencia por inactividad sanitaria

- **Condición**: un lote no tiene ninguna actividad sanitaria registrada en los últimos N días.
- **N configurable**: por defecto 30 días.
- **Urgencia**: `informativa` (es una sugerencia, no un error).
- **Resolución**: automática cuando se registra una actividad sanitaria sobre el lote o cualquier animal del lote. También puede desestimarse manualmente.
- **Información que muestra**: nombre del lote, días desde la última actividad sanitaria (o "nunca" si no tiene ninguna).

---

## Ciclo de vida de una alerta

```
Condición detectada → Alerta generada (activa)
        ↓
   Condición resuelta (automáticamente) → Alerta resuelta
        o
   Usuario la desestima manualmente → Alerta desestimada
```

- **Generación**: el sistema evalúa las condiciones periódicamente (y en cada sincronización).
- **Resolución automática**: cuando la condición que la originó ya no existe (ej: carencia venció, actividad registrada).
- **Desestimación manual**: el usuario puede marcar una sugerencia como "ignorar". Las alertas críticas no pueden desestimarse manualmente.
- Las alertas resueltas y desestimadas no se muestran en el listado activo pero son consultables en el historial de alertas.

---

## Diferencia entre alertas y sugerencias

| | Alerta | Sugerencia |
|---|---|---|
| Origen | Condición de negocio crítica o de advertencia | Condición de buena práctica |
| Urgencia | `advertencia` o `crítica` | `informativa` |
| Puede desestimarse | No (críticas), sí (advertencias) | Sí |
| Ejemplo | Carencia próxima a vencer | Lote sin actividad en 30 días |

---

## Fuera de alcance (MVP)

- Vista agregada de alertas de múltiples establecimientos
- Notificaciones push al dispositivo
- Configuración de alertas personalizadas por el usuario (más allá de los umbrales de días)
- Dashboard con gráficos históricos o evolución temporal
- Alertas basadas en peso, reproducción, o sanidad epidemiológica
