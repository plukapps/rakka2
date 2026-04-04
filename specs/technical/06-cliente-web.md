# Cliente Web — Next.js

## Stack

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Firebase SDK**: `firebase` (JS SDK v10+)
- **Estado global**: Zustand (lightweight, sin boilerplate de Redux)
- **Formularios**: React Hook Form
- **Iconos**: Lucide React

---

## Estructura de carpetas

```
app/                              ← App Router de Next.js
├── (auth)/                       ← Rutas públicas (sin autenticación requerida)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (app)/                        ← Rutas protegidas (requieren auth)
│   ├── layout.tsx                ← Layout con sidebar, header, establecimiento activo
│   ├── page.tsx                  ← Home / Dashboard
│   ├── animales/
│   │   ├── page.tsx              ← Listado de animales
│   │   ├── nuevo/
│   │   │   └── page.tsx          ← Formulario de ingreso
│   │   └── [animalId]/
│   │       └── page.tsx          ← Perfil del animal
│   ├── lotes/
│   │   ├── page.tsx
│   │   ├── nuevo/
│   │   │   └── page.tsx
│   │   └── [lotId]/
│   │       └── page.tsx
│   ├── actividades/
│   │   ├── sanitarias/
│   │   │   └── nueva/
│   │   │       └── page.tsx
│   │   └── comerciales/
│   │       └── nueva/
│   │           └── page.tsx
│   ├── trazabilidad/
│   │   └── [animalId]/
│   │       └── page.tsx
│   ├── alertas/
│   │   └── page.tsx
│   └── establecimientos/
│       ├── page.tsx
│       ├── nuevo/
│       │   └── page.tsx
│       └── [estId]/
│           └── page.tsx
├── layout.tsx                    ← Root layout (fonts, providers)
└── globals.css

lib/
├── firebase/
│   ├── config.ts                 ← Inicialización de Firebase App
│   ├── auth.ts                   ← Helpers de Firebase Auth
│   └── database.ts               ← Referencia a RTDB, helpers de lectura/escritura
├── repositories/
│   ├── animalRepository.ts
│   ├── lotRepository.ts
│   ├── activityRepository.ts
│   ├── traceabilityRepository.ts
│   └── alertRepository.ts
├── stores/
│   ├── authStore.ts              ← Estado del usuario autenticado
│   └── appStore.ts               ← Establecimiento activo, estado de conexión
└── types/
    ├── animal.ts
    ├── lot.ts
    ├── activity.ts
    └── alert.ts

components/
├── ui/                           ← Componentes genéricos (Button, Input, Badge, etc.)
├── animals/                      ← Componentes específicos de animales
├── lots/
├── activities/
└── layout/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── EstablishmentSelector.tsx
```

---

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/login` | Pantalla de login |
| `/register` | Registro de usuario |
| `/` | Home: actividad reciente, alertas, accesos rápidos |
| `/animales` | Listado de animales del est. activo |
| `/animales/nuevo` | Formulario de ingreso individual |
| `/animales/[id]` | Perfil del animal + historial |
| `/lotes` | Listado de lotes |
| `/lotes/[id]` | Detalle del lote + animales |
| `/actividades/sanitarias/nueva` | Formulario de actividad sanitaria |
| `/actividades/comerciales/nueva` | Formulario de actividad comercial |
| `/alertas` | Listado completo de alertas |
| `/establecimientos` | Gestión de establecimientos |

---

## Estrategia de rendering

- **Server Components**: páginas de rutas estáticas (login, register, layout externo). No tienen acceso al estado del usuario en el servidor; la auth se valida en el middleware.
- **Client Components** (marcados con `"use client"`): cualquier componente que use hooks de React, Firebase listeners, o estado de Zustand. La mayoría de las páginas de la app son Client Components por los datos en tiempo real.
- **Middleware** (`middleware.ts`): redirige usuarios no autenticados desde rutas `(app)` hacia `/login`. Verifica el token de Firebase Auth en la cookie de sesión.

> Para MVP, la autenticación se mantiene con el estado del SDK de Firebase en el cliente (no SSR auth). El middleware hace una comprobación básica de cookie; la validación real ocurre en el cliente al montar los componentes.

---

## Estado global con Zustand

### `authStore`

```typescript
interface AuthStore {
  user: FirebaseUser | null
  userProfile: UserProfile | null
  isLoading: boolean
  setUser: (user: FirebaseUser | null) => void
  setUserProfile: (profile: UserProfile | null) => void
}
```

### `appStore`

```typescript
interface AppStore {
  activeEstablishmentId: string | null
  isOffline: boolean
  setActiveEstablishment: (estId: string) => void
  setIsOffline: (offline: boolean) => void
}
```

---

## Integración con Firebase RTDB

Los repositories en `lib/repositories/` encapsulan toda la lógica de acceso a RTDB:

```typescript
// Ejemplo: animalRepository.ts
import { ref, onValue, push, update } from "firebase/database"
import { db } from "@/lib/firebase/database"

export function subscribeToAnimals(
  estId: string,
  callback: (animals: Animal[]) => void
): () => void {
  const animalsRef = ref(db, `animals/${estId}`)
  const unsubscribe = onValue(animalsRef, (snapshot) => {
    const data = snapshot.val() ?? {}
    const animals = Object.entries(data).map(([id, val]) => ({
      id,
      ...(val as AnimalData),
    }))
    callback(animals)
  })
  return unsubscribe // llamar para limpiar el listener
}
```

Los componentes usan los repositories a través de custom hooks:

```typescript
// hooks/useAnimals.ts
export function useAnimals(estId: string) {
  const [animals, setAnimals] = useState<Animal[]>([])
  useEffect(() => {
    const unsub = subscribeToAnimals(estId, setAnimals)
    return unsub
  }, [estId])
  return animals
}
```

---

## Consideraciones MVP

- **Sin SSR de datos**: todos los datos de Firebase se cargan en el cliente. No hay `getServerSideProps` con datos de RTDB.
- **Sin paginación en MVP**: se cargan todos los animales del establecimiento activo. Para establecimientos con miles de animales, esto puede ser un problema; se resuelve en fases siguientes con paginación o virtualización.
- **Formularios sin librerías de validación complejas**: React Hook Form con validación nativa para MVP.
