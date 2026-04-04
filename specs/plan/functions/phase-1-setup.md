# Functions — Fase 1: Setup y functions base

**Estado:** ⏳ pendiente  
**Depende de:** Web Fase 7 ✅ (o cuando se decida conectar Firebase)

## Objetivo

Inicializar el proyecto de Cloud Functions y configurar el entorno de desarrollo con emuladores locales.

Spec técnica: `specs/technical/04-cloud-functions.md`

---

## Tareas

### Proyecto
- [ ] `firebase init` en `code/functions/`: seleccionar Functions + Realtime Database + Emulators
- [ ] Elegir TypeScript, ESLint, instalar dependencias
- [ ] Configurar `firebase.json` con paths a `code/functions/`
- [ ] `.firebaserc` apuntando al proyecto dev (`rakka2-dev`)
- [ ] `database.rules.json` con los índices y Security Rules del spec (`specs/technical/03-autenticacion.md`)

### Estructura de archivos (`code/functions/src/`)
- [ ] `index.ts` — solo exportaciones de los demás archivos
- [ ] `types.ts` — interfaces TypeScript de todos los modelos (importadas por las functions)
- [ ] `utils.ts` — helpers: `generateId()`, `now()`, `buildTraceabilityEvent()`

### Emuladores
- [ ] Verificar `firebase emulators:start` levanta Auth + RTDB + Functions sin errores
- [ ] `firebase.json` con seeds de datos de prueba (o script de seed)

---

## Criterios de done

- [ ] `npm run build` en `code/functions/` compila sin errores
- [ ] `firebase emulators:start` corre los 3 emuladores
- [ ] Las Security Rules bloquean acceso cruzado entre establecimientos (test manual en emulador)
