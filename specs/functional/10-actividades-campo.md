# Actividades de Control de Campo

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`)

---

## Concepto

Las actividades de control de campo son registros operativos periódicos que no implican sanidad ni comercialización, pero son esenciales para el seguimiento productivo del rodeo. Incluyen pesajes, conteos, revisiones y otros controles rutinarios.

---

## Subtipos

| Subtipo | Descripción |
|---|---|
| `weighing` | Pesaje individual o grupal |
| `count` | Conteo de animales (verificación de existencias) |
| `body_condition` | Evaluación de condición corporal |
| `pregnancy_check` | Revisión de preñez (diagnóstico, no el acto reproductivo) |
| `other` | Otro control de campo definido por el usuario |

---

## Atributos específicos

### Pesaje (`weighing`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Peso (kg) | Número | Sí | Peso individual. Si aplica a un grupo, es el peso promedio o se registra individualmente. |
| Báscula | Texto | No | Identificación de la báscula o balanza usada |
| Condición corporal | Número (1-5 o 1-9) | No | Escala subjetiva; puede registrarse en conjunto con el pesaje |

> Para pesajes grupales con RFID + báscula automatizada: el archivo de lectura puede incluir el peso por caravana en una segunda columna. El sistema detecta el formato y pre-carga los pesos individuales.

### Conteo (`count`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Total contado | Número | Sí (calculado) | Se calcula automáticamente desde la lista de animales seleccionados |
| Diferencia con existencia esperada | Número | Automático | Sistema calcula: total contado vs. total activo en el establecimiento |
| Observaciones | Texto | No | Explicación si hay diferencia |

### Revisión general / otro (`body_condition`, `pregnancy_check`, `other`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Resultado / valor | Texto libre | No | Resultado de la revisión |
| Observaciones | Texto | No | Notas adicionales |

---

## Comportamiento especial: pesaje por RFID + archivo

Cuando el operador usa una báscula con lector RFID integrado, el archivo de exportación puede tener el formato:

```
caravana,peso_kg
AR-1234,320.5
AR-5678,298.0
```

El sistema detecta si hay una segunda columna numérica y la interpreta como peso. Esto pre-carga los pesos individuales sin necesidad de ingresarlos manualmente.

---

## GDP — Ganancia Diaria de Peso

El sistema calcula automáticamente la **ganancia diaria de peso (GDP)** para cada animal que tenga pesajes individuales registrados (`weightsByAnimal`). Los pesajes con peso promedio grupal (`weightKg` sin `weightsByAnimal`) no generan datos de GDP.

### Métricas

Se calculan dos métricas complementarias:

| Métrica | Fórmula | Descripción |
|---|---|---|
| **GDP Reciente** | `(peso_actual - peso_anterior) / días_entre_pesajes` | Rendimiento del período más reciente. Si solo hay un pesaje, usa el peso de ingreso como referencia. |
| **GDP Acumulada** | `(último_peso - peso_ingreso) / días_desde_ingreso` | Rendimiento promedio de toda la vida del animal en el establecimiento. Requiere `entryWeight`. |

Ambas métricas se expresan en **kg/día**. Valores negativos son válidos (pérdida de peso).

### Campos denormalizados en el animal

Al registrar una actividad de pesaje con pesos individuales, la Cloud Function actualiza estos campos en cada animal pesado:

| Campo | Tipo | Descripción |
|---|---|---|
| `lastWeight` | Número (kg) | Último peso registrado |
| `lastWeightDate` | Timestamp | Fecha del último pesaje |
| `gdpRecent` | Número (kg/día) | GDP entre los últimos 2 pesajes (o vs ingreso si es el primero) |
| `gdpAccumulated` | Número (kg/día) | GDP desde el ingreso hasta el último pesaje |

Estos campos son **solo lectura para el cliente** — los escribe exclusivamente la Cloud Function, igual que `hasActiveCarencia`.

### Visualización

- **Perfil del animal**: historial de pesos, GDP reciente y acumulada, gráfico de evolución de peso.
- **Detalle del lote**: peso promedio del lote, rango, GDP promedio, gráfico de evolución, calculadora de proyección a peso objetivo.
- **Dashboard (Home)**: resumen por lote con peso promedio y GDP.

### Proyección a peso objetivo

El usuario puede ingresar un peso objetivo (ej: 450 kg) de forma ad-hoc al consultar un lote. El sistema calcula los días estimados para alcanzar ese peso usando la GDP reciente promedio del lote:

```
días_estimados = (peso_objetivo - peso_promedio_actual) / gdp_reciente_promedio
```

El peso objetivo no se persiste — es un input temporal para la consulta.

---

## Fuera de alcance (MVP)

- Integración directa con básculas electrónicas por Bluetooth o puerto serial
- Alertas automáticas de GDP por debajo de umbrales configurados (ver `specs/plan/nextsteps/gdp-alerts.md`)
