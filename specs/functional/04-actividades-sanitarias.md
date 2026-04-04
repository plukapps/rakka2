# Actividades Sanitarias

**Dependencias:** Animales (`02-animales.md`), Lotes (`03-lotes.md`)

---

## Tipos de actividad sanitaria

En el MVP, vacunaciones y tratamientos se registran con el mismo formulario y tienen el mismo conjunto de atributos. No hay diferencia funcional entre ambos tipos más allá del campo "tipo" que sirve para categorizar y filtrar en el historial.

| Tipo | Descripción |
|---|---|
| `vacunación` | Aplicación de una vacuna preventiva |
| `tratamiento` | Aplicación de un medicamento curativo o preventivo no vacunal |

---

## Atributos del registro sanitario

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Tipo | Enum | Sí | `vacunación` o `tratamiento` |
| Producto | Texto libre | Sí | Nombre del medicamento o vacuna |
| Dosis | Texto libre | No | Cantidad aplicada (ej: "5 ml", "2 comprimidos") |
| Vía de administración | Enum | No | `inyectable subcutáneo`, `inyectable intramuscular`, `oral`, `tópico`, `otro` |
| Días de carencia | Número entero | No | 0 o más. 0 significa sin carencia. |
| Fecha de aplicación | Fecha | Sí | Por defecto: fecha actual |
| Responsable | Texto libre | No | Quién aplicó el producto (persona, veterinaria) |
| Observaciones | Texto libre | No | Notas adicionales |

---

## Registro sobre animal individual

1. El usuario accede al perfil del animal o al formulario de registro de actividad.
2. Selecciona el tipo (`vacunación` o `tratamiento`).
3. Completa los atributos del formulario.
4. Al confirmar:
   - Se crea el registro de actividad sanitaria vinculado al animal.
   - Se genera un evento de trazabilidad: `actividad sanitaria`.
   - Si hay días de carencia > 0, se calcula y almacena la fecha de vencimiento de carencia.

**Validaciones:**
- El animal debe estar en estado `activo`. No se puede registrar actividad sobre un animal egresado.

---

## Registro sobre lote completo

1. El usuario accede al detalle del lote o al formulario de registro por lote.
2. Selecciona el lote y el tipo de actividad.
3. Completa los atributos del formulario (aplican igual para todos los animales del lote).
4. El sistema muestra cuántos animales tiene el lote y cuáles recibirán la actividad.
5. Al confirmar:
   - Se crea un registro individual de actividad sanitaria **por cada animal activo del lote en ese momento**.
   - Cada registro es independiente: tiene los mismos atributos pero está vinculado al animal individualmente.
   - Se genera un evento de trazabilidad en cada animal.
   - Los animales que ingresen al lote después no heredan esta actividad.

---

## Carencia

### Cálculo de vencimiento

```
fecha de vencimiento = fecha de aplicación + días de carencia
```

Si `días de carencia = 0`, el animal no queda con carencia activa.

### Carencia activa

Un animal tiene **carencia activa** cuando:

```
fecha actual < fecha de vencimiento de la carencia más reciente vigente
```

Si el animal tiene múltiples actividades sanitarias con carencia, la carencia vigente es la de **fecha de vencimiento más lejana** entre todas las que aún no vencieron.

### Impacto en actividades comerciales

Un animal con carencia activa no puede ser incluido en una venta o despacho. El bloqueo es por animal (ver `05-actividades-comerciales.md`).

### Visualización de carencia

- En el perfil del animal: si tiene carencia activa, se muestra el producto, la fecha de vencimiento y los días restantes. El indicador debe ser visualmente destacado.
- En el listado de animales: filtro y badge para animales con carencia activa.
- En alertas: el sistema genera alertas cuando la carencia está próxima a vencer (ver `07-alertas-y-dashboard.md`).

---

## Historial sanitario del animal

- Se puede acceder al historial completo de actividades sanitarias desde el perfil del animal.
- Las actividades se muestran en orden cronológico inverso (más reciente primero).
- Cada entrada muestra: tipo, producto, fecha, responsable.
- Al expandir: dosis, vía, días de carencia, fecha de vencimiento de carencia, observaciones.

---

## Fuera de alcance (MVP)

- Biblioteca o catálogo de productos sanitarios predefinidos
- Alertas de revacunación programada (ej: repetir en 21 días)
- Registro de lotes de vacuna (número de lote del fabricante, vencimiento del producto)
- Protocolos sanitarios (secuencias de actividades predefinidas)
- Integración con registros SENASA
