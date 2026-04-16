# Actividades de Reproducción

> **MVP**: El tipo "Reproducción" está oculto en el selector de actividades hasta que se complete el diseño del flujo. La ruta `/activities/new/reproduction` existe pero no se muestra en el hub.

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`)

---

## Concepto

Las actividades reproductivas registran los eventos del ciclo productivo de los animales: servicio, diagnóstico de preñez, partos y destete. Son relevantes principalmente para hembras y para el seguimiento de la productividad del rodeo.

---

## Subtipos

| Subtipo | Descripción | Aplica a |
|---|---|---|
| `service` | Servicio (natural o inseminación artificial) | Hembras |
| `pregnancy_diagnosis` | Diagnóstico de preñez (positivo/negativo) | Hembras |
| `birth` | Parto registrado | Hembra madre |
| `weaning` | Destete de cría | Ternero/a |

---

## Atributos específicos

### Servicio (`service`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Tipo de servicio | Enum | Sí | `natural`, `artificial_insemination`, `embryo_transfer` |
| Toro / Material genético | Texto | No | Identificación del toro o semen usado |
| Fecha de servicio | Fecha | Sí | Por defecto: fecha actual |

### Diagnóstico de preñez (`pregnancy_diagnosis`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Resultado | Enum | Sí | `positive` (preñada), `negative` (vacía), `uncertain` |
| Meses de preñez | Número | No | Si el resultado es positivo |
| Método diagnóstico | Texto | No | Tacto, ecografía, etc. |

### Parto (`birth`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Resultado del parto | Enum | Sí | `live`, `stillborn`, `abortion` |
| Sexo de la cría | Enum | No | `male`, `female` |
| Caravana de la cría | Texto | No | Si se le asigna caravana en el momento del nacimiento, genera el ingreso del nuevo animal automáticamente |
| Peso al nacer (kg) | Número | No | |

### Destete (`weaning`)

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Peso al destete (kg) | Número | No | |
| Edad al destete (días) | Número | No | Calculado si se conoce fecha de nacimiento |

---

## Reglas de negocio

- Si en un parto se registra la caravana de la cría, el sistema crea automáticamente el ingreso del nuevo animal con tipo `birth` y madre referenciada.
- El destete se registra sobre el ternero/a, no sobre la madre.
- Los diagnósticos de preñez negativos no generan ninguna acción adicional; los positivos pueden generar una sugerencia de alerta para fecha estimada de parto.

---

## Fuera de alcance (MVP)

- Árbol genealógico (madre/padre/cría)
- Cálculo automático de fecha estimada de parto
- Índices de productividad reproductiva (% preñez, intervalo entre partos)
- Registro de inseminación con seguimiento de pajuelas
