# Web — Fase 3: Módulo Animales

**Estado:** ⏳ pendiente  
**Depende de:** Fase 2 ✅

## Objetivo

Implementar las tres pantallas del módulo de animales: listado con filtros y búsqueda, formulario de ingreso con validación de caravana única, y perfil completo del animal con carencia y acceso a trazabilidad.

Spec funcional: `specs/functional/02-animales.md`

---

## Tareas

### Listado de animales (`/animales`)
- [ ] Tabla o lista de animales activos del establecimiento activo
- [ ] Búsqueda por caravana o nombre (filtra en cliente)
- [ ] Filtros: por lote (dropdown), por categoría (dropdown), por carencia activa (toggle)
- [ ] Badge de carencia activa en cada fila (días restantes)
- [ ] Badge de estado (activo/egresado)
- [ ] Botón "Ingresar animal" → `/animales/nuevo`
- [ ] Click en animal → `/animales/[animalId]`
- [ ] Estado vacío si no hay animales
- [ ] Incluir animales egresados con filtro "Mostrar egresados" (off por defecto)

### Componentes nuevos
- [ ] `components/animals/AnimalCard.tsx` — fila/card de animal para el listado
- [ ] `components/animals/AnimalFilters.tsx` — panel de filtros (lote, categoría, carencia)
- [ ] `components/animals/CarenciaIndicator.tsx` — badge con días restantes y color por urgencia

### Formulario de ingreso (`/animales/nuevo`)
- [ ] Campos: caravana (obligatorio), categoría, raza, sexo, fecha nacimiento, peso ingreso, procedencia, motivo ingreso
- [ ] **Validación**: caravana única en el establecimiento activo (buscar en mock store)
- [ ] Opción de asignar a un lote al momento del ingreso
- [ ] Al confirmar: crear animal en mock store + evento de trazabilidad `"ingreso"`
- [ ] Redirigir al perfil del animal creado

### Perfil del animal (`/animales/[animalId]`)
- [ ] Sección datos base: todos los atributos del animal
- [ ] Sección estado: activo/egresado (con fecha y tipo si egresado)
- [ ] Sección lote actual: nombre del lote o "Sin lote", link al lote
- [ ] Sección carencia: si activa → producto, fecha vencimiento, días restantes (destacado). Si no → "Sin carencia activa"
- [ ] Sección últimas actividades: las 3 más recientes con link a trazabilidad completa
- [ ] Botón "Ver trazabilidad completa" → `/trazabilidad/[animalId]`
- [ ] Botón "Registrar actividad" → `/actividades/sanitarias/nueva?animalId=xxx`
- [ ] Si animal activo: botón "Registrar egreso" → modal de egreso
- [ ] Modal de egreso: tipo (muerte/transferencia), observaciones, confirmar

---

## Archivos a modificar/crear

```
code/web-app/
├── app/(app)/animales/
│   ├── page.tsx
│   ├── nuevo/page.tsx
│   └── [animalId]/page.tsx
└── components/animals/
    ├── AnimalCard.tsx
    ├── AnimalFilters.tsx
    └── CarenciaIndicator.tsx
```

---

## Criterios de done

- [ ] Listado muestra los 40 animales mock con filtros funcionales
- [ ] Filtrar por "carencia activa" muestra exactamente los 3 animales con carencia
- [ ] Ingresar animal con caravana existente muestra error de validación
- [ ] Ingresar animal válido aparece inmediatamente en el listado (mock store reactivo)
- [ ] Perfil del animal muestra todos los datos y el indicador de carencia correcto
- [ ] Egreso por muerte cambia el estado del animal a egresado en toda la UI
