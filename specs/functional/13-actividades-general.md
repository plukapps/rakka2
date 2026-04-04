# Actividades General / Libre

**Dependencias:** Framework de actividades (`04-actividades-framework.md`), Animales (`02-animales.md`)

---

## Concepto

La actividad general permite registrar cualquier evento sobre animales que no encaja en los tipos estructurados. Es una válvula de escape para capturar información relevante sin restringir al usuario a categorías predefinidas.

---

## Atributos

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Título / etiqueta | Texto | Sí | Descripción corta del evento (ej: "Revisión veterinaria", "Entrada a manga") |
| Descripción | Texto | No | Detalle libre del evento |
| Fecha | Fecha | Sí | Por defecto: fecha actual |
| Responsable | Texto | No | |

---

## Reglas de negocio

- Una actividad general queda en la trazabilidad del animal con tipo `general` y el título ingresado por el usuario.
- No genera ningún cambio de estado en el animal (no egresa, no modifica carencia, no genera alertas automáticas).
- Puede usarse con cualquier método de selección de animales (RFID, lote, individual).

---

## Fuera de alcance (MVP)

- Etiquetas o tags personalizados para categorizar actividades generales
- Adjuntos (fotos, documentos) a actividades generales
- Creación de tipos de actividad personalizados por el usuario
