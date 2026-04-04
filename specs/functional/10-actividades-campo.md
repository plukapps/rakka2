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

## Fuera de alcance (MVP)

- Integración directa con básculas electrónicas por Bluetooth o puerto serial
- Gráficos de evolución de peso por animal a lo largo del tiempo
- Alertas de ganancia de peso por debajo de umbrales esperados
