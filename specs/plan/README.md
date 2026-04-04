# Plan de Implementación — Rakka2

## Estado general

| Fase | Web | Android | iOS |
|---|---|---|---|
| [1 — Setup y fundamentos](web/phase-1-setup.md) | ⏳ | — | — |
| [2 — Layout y navegación](web/phase-2-layout.md) | ⏳ | — | — |
| [3 — Módulo Animales](web/phase-3-animales.md) | ⏳ | — | — |
| [4 — Módulo Lotes](web/phase-4-lotes.md) | ⏳ | — | — |
| [5 — Actividades](web/phase-5-actividades.md) | ⏳ | — | — |
| [6 — Trazabilidad y Alertas](web/phase-6-trazabilidad-alertas.md) | ⏳ | — | — |
| [7 — Home y Establecimientos](web/phase-7-home-establecimientos.md) | ⏳ | — | — |

**Estados:** `⏳ pendiente` · `🔄 en curso` · `✅ completo` · `—` no iniciado

---

## Contexto de implementación

- **Web**: Next.js 14 App Router + TypeScript + Tailwind + Zustand. Datos mockeados (sin Firebase). Ver `specs/technical/06-cliente-web.md`.
- **Android**: Kotlin + Jetpack Compose + MVVM + Hilt. Ver `specs/technical/07-cliente-android.md`. _(pendiente de planificar)_
- **iOS**: Swift + SwiftUI + MVVM. Ver `specs/technical/08-cliente-ios.md`. _(pendiente de planificar)_

## Convenciones de este directorio

- Actualizar el estado en esta tabla al iniciar (`🔄`) y completar (`✅`) cada fase.
- Marcar las tareas con `[x]` en el archivo de la fase a medida que se completan.
- No adelantar fases: cada una debe estar `✅` antes de iniciar la siguiente.
