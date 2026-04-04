# Actividades de Movimiento / Traslado

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`), Lotes (`03-lotes.md`)

---

## Concepto

Los movimientos registran el traslado físico de animales entre potreros, corrales o campos dentro o fuera del establecimiento. Se diferencian del cambio de lote (que es una agrupación operativa) porque documentan el desplazamiento geográfico real del animal.

> En el MVP, el "campo" y el "potrero/corral" son texto libre. No hay mapa ni geolocalización.

---

## Subtipos

| Subtipo | Descripción |
|---|---|
| `paddock_move` | Movimiento entre potreros o corrales dentro del mismo establecimiento |
| `field_transfer` | Traslado a otro establecimiento del mismo usuario |
| `external_transfer` | Traslado a un campo externo (de terceros), sin egreso comercial |

> `field_transfer` genera automáticamente un egreso en el establecimiento de origen y un ingreso en el destino (equivalente al egreso por "transferencia" en `02-animales.md`).

---

## Atributos específicos

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Origen | Texto libre | No | Potrero, corral o campo de origen |
| Destino | Texto libre | Sí | Potrero, corral o campo destino |
| Establecimiento destino | Referencia | Solo para `field_transfer` | Establecimiento del mismo usuario al que van los animales |
| Motivo | Texto libre | No | Razón del traslado |
| Transportista | Texto libre | No | Empresa o persona que realizó el transporte |

---

## Reglas de negocio

- Un movimiento de tipo `field_transfer` dispara el flujo de egreso/ingreso entre establecimientos (ver `02-animales.md`).
- Un movimiento de tipo `paddock_move` puede opcionalmente asignar los animales a un lote en el destino.
- Los movimientos no validan carencia (un animal con carencia puede moverse entre potreros).

---

## Fuera de alcance (MVP)

- Geolocalización del origen y destino
- Mapas de potreros con polígonos
- Rutas de traslado o historial de ubicaciones
