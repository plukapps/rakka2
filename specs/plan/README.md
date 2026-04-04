# Plan de Implementación — Rakka2

## Estructura del código

```
code/
├── web-app/        ← Next.js 14 + TypeScript + Tailwind
├── android-app/    ← Kotlin + Jetpack Compose + Hilt
├── ios-app/        ← Swift + SwiftUI
└── functions/      ← Firebase Cloud Functions (Node.js + TypeScript)
```

---

## Estado general

### Web (`code/web-app/`)

| Fase | Estado |
|---|---|
| [1 — Setup y fundamentos](web/phase-1-setup.md) | ✅ |
| [2 — Layout y navegación](web/phase-2-layout.md) | ✅ |
| [3 — Módulo Animales](web/phase-3-animales.md) | ✅ |
| [4 — Módulo Lotes](web/phase-4-lotes.md) | ⏳ |
| [5 — Actividades](web/phase-5-actividades.md) | ⏳ |
| [6 — Trazabilidad y Alertas](web/phase-6-trazabilidad-alertas.md) | ⏳ |
| [7 — Home y Establecimientos](web/phase-7-home-establecimientos.md) | ⏳ |

### Android (`code/android-app/`)

| Fase | Estado |
|---|---|
| [1 — Setup y arquitectura base](android/phase-1-setup.md) | ⏳ |
| [2 — Auth y navegación](android/phase-2-auth-nav.md) | ⏳ |
| [3 — Módulo Animales](android/phase-3-animales.md) | ⏳ |
| [4 — Módulo Lotes](android/phase-4-lotes.md) | ⏳ |
| [5 — Actividades y RFID](android/phase-5-actividades.md) | ⏳ |
| [6 — Trazabilidad y Alertas](android/phase-6-trazabilidad-alertas.md) | ⏳ |
| [7 — Home y Establecimientos](android/phase-7-home-establecimientos.md) | ⏳ |

### iOS (`code/ios-app/`)

| Fase | Estado |
|---|---|
| [1 — Setup y arquitectura base](ios/phase-1-setup.md) | ⏳ |
| [2 — Auth y navegación](ios/phase-2-auth-nav.md) | ⏳ |
| [3 — Módulo Animales](ios/phase-3-animales.md) | ⏳ |
| [4 — Módulo Lotes](ios/phase-4-lotes.md) | ⏳ |
| [5 — Actividades y RFID](ios/phase-5-actividades.md) | ⏳ |
| [6 — Trazabilidad y Alertas](ios/phase-6-trazabilidad-alertas.md) | ⏳ |
| [7 — Home y Establecimientos](ios/phase-7-home-establecimientos.md) | ⏳ |

### Cloud Functions (`code/functions/`)

| Fase | Estado |
|---|---|
| [1 — Setup y functions base](functions/phase-1-setup.md) | ⏳ |
| [2 — Functions de actividades](functions/phase-2-activities.md) | ⏳ |
| [3 — Alertas programadas](functions/phase-3-alerts.md) | ⏳ |

---

## Estados: `⏳ pendiente` · `🔄 en curso` · `✅ completo`

## Convenciones
- Actualizar estado al iniciar (`🔄`) y completar (`✅`) cada fase.
- Marcar tareas con `[x]` en el archivo de la fase.
- No adelantar fases: cada una debe estar `✅` antes de iniciar la siguiente dentro de la misma plataforma.
- Las plataformas pueden avanzar en paralelo.
