# Diseño Desktop — Sistema y Layout General

> Plataforma: Web (Next.js). Viewport mínimo: 1280px.  
> Las specs de mobile (iOS/Android) son un documento separado, pendiente.

---

## 1. Layout raíz

La app usa un layout de **tres bandas**: sidebar fijo a la izquierda, header fijo arriba, contenido principal con scroll.

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (sticky, 60px)                                   │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │   MAIN CONTENT                               │
│ (240px)  │   (flex-1, overflow-y: auto)                 │
│ (fixed)  │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

- **Sidebar**: ancho fijo 240px, siempre visible, no colapsa en desktop.
- **Header**: altura 60px, sticky. Contiene el selector de establecimiento y datos del usuario.
- **Main content**: ocupa el espacio restante. Padding interno: 32px (horizontal y vertical). Ancho máximo del contenido interior: 1200px, centrado.

---

## 2. Sidebar

### Estructura
```
┌────────────────────┐
│  RAKKA  (logo)     │
├────────────────────┤
│  • Inicio          │
│  • Animales        │
│  • Lotes           │
│  • Actividades     │
│  • Lecturas RFID   │
│  • Alertas     [N] │
├────────────────────┤
│  (espacio flex)    │
├────────────────────┤
│  • Establecimientos│
└────────────────────┘
```

### Comportamiento de ítems
- Ícono SVG + label de texto.
- Estado activo: fondo resaltado + texto en color primario.
- Estado hover: fondo sutil.
- **Alertas**: muestra badge numérico con la cantidad de alertas activas. Se oculta si es 0.

---

## 3. Header

```
┌──────────────────────────────────────────────────────────┐
│  [EstablishmentSelector ▾]          [Nombre usuario] [↪] │
└──────────────────────────────────────────────────────────┘
```

### EstablishmentSelector
- Dropdown con el nombre del establecimiento activo.
- Al abrir: lista de establecimientos del usuario + opción "Crear nuevo".
- Estado sin establecimiento: muestra "Seleccionar establecimiento".

### Usuario
- Nombre del usuario logueado.
- Botón "Salir" (ícono o texto).

---

## 4. Área de contenido

### Estructura interna por página

```
┌──────────────────────────────────────┐
│  Page Header                         │
│  ─ Título + subtítulo (opcional)     │
│  ─ Acción primaria (botón derecha)   │
├──────────────────────────────────────┤
│  Toolbar / Filtros (si aplica)       │
├──────────────────────────────────────┤
│  Contenido principal                 │
│  (lista, grilla, detalle, formulario)│
└──────────────────────────────────────┘
```

---

## 5. Tokens de diseño

### Espaciado
| Token | Valor | Uso |
|---|---|---|
| `xs` | 4px | Gap entre iconos y texto |
| `sm` | 8px | Padding interno de chips/badges |
| `md` | 16px | Gap entre elementos de una sección |
| `lg` | 24px | Separación entre secciones |
| `xl` | 32px | Padding de página |
| `2xl` | 48px | Separación entre módulos grandes |

### Tipografía
| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| `page-title` | 24px | 700 | Título de página |
| `section-title` | 18px | 600 | Título de sección/card |
| `body` | 14px | 400 | Contenido general |
| `label` | 12px | 500 | Labels de campos, metadatos |
| `caption` | 11px | 400 | Timestamps, textos auxiliares |

### Colores funcionales
| Token | Uso |
|---|---|
| `primary` | Acciones principales, links, estado activo en sidebar |
| `success` (green) | Estado "activo", carencia sin problema |
| `warning` (amber) | Carencia próxima a vencer, estado advertencia |
| `danger` (red) | Carencia activa, estado crítico, animal bloqueado |
| `neutral` (gray) | Estado archivado, disuelto, inactivo |
| `info` (blue) | Alertas informativas, tooltips |

---

## 6. Componentes compartidos

### Card
- Fondo blanco, borde `1px solid` gris claro, border-radius 8px.
- Sombra sutil (`shadow-sm`).
- Padding interno: 16px.

### StatusBadge
Pill con fondo de color + texto:
- `active` → verde
- `exited` → gris
- `dissolved` → gris
- `warning` → amber
- `critical` → rojo

### EmptyState
- Ícono grande + título + descripción + CTA (botón).
- Centrado en el contenedor.
- Variantes: sin datos, sin resultados de búsqueda, sin establecimiento seleccionado.

### LoadingSpinner
- Spinner centrado en el contenedor con overlay semitransparente.
- Para listas: skeleton de cards.

### Offline Banner
- Banner sticky debajo del header.
- Texto: "Sin conexión — los cambios se sincronizarán al reconectarse".
- Color: amber / warning.
- Se oculta automáticamente al reconectarse.

---

## 7. Patrones de estado por pantalla

Toda pantalla de listado debe manejar:

| Estado | Comportamiento |
|---|---|
| Cargando | Skeleton o spinner centrado |
| Vacío (sin datos) | EmptyState con CTA contextual |
| Sin resultados (filtros) | EmptyState de "sin coincidencias" + botón limpiar filtros |
| Error de carga | Mensaje de error + botón reintentar |
| Offline | Banner de aviso; la data cacheada sigue visible |

---

## 8. Navegación entre pantallas

### Flujos principales
- Desde **Home** → Accesos rápidos → Animales, Lotes, Nueva Actividad, Nuevo Animal.
- Desde **Animales** (card) → Detalle de animal → Trazabilidad del animal.
- Desde **Lotes** (card) → Detalle de lote → Animales del lote → Registrar actividad sobre lote.
- Desde **Actividades** → Nueva actividad → Hub de tipos → Formulario específico.
- Desde **Alertas** (item) → Animal relacionado (si aplica).
- Desde **Trazabilidad** → Búsqueda → Timeline del animal.
- Desde **Header** → EstablishmentSelector → Cambio de contexto global.

### Breadcrumb
- En páginas de detalle y subpáginas mostrar breadcrumb mínimo: `Módulo / Elemento`.
- Ejemplo: `Animales / 858000000011234` o `Lotes / Lote Norte`.

### URL como fuente de verdad
- Las páginas de detalle usan el ID en la URL (`/animals/[id]`, `/lots/[lotId]`).
- Al cambiar de establecimiento, redirigir a `/home` para evitar contexto inconsistente.
