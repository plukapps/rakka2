# Diseño Desktop — Pantallas de Autenticación

**Rutas**: `/login` · `/register`  
**Propósito**: Acceso al sistema. Sin sidebar ni header. Diseño centrado.

---

## 1. Layout base (compartido por login y register)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                                                        │
│              ┌──────────────────────┐                  │
│              │  RAKKA               │                  │
│              │  (logo/brand)        │                  │
│              │                      │                  │
│              │  [Formulario]        │                  │
│              │                      │                  │
│              └──────────────────────┘                  │
│                                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- Fondo: color neutro suave (gris muy claro o blanco).
- Card central: ancho fijo ~420px, centrado vertical y horizontalmente.
- Sin sidebar, sin header.

---

## 2. Login (`/login`)

### Contenido del card

```
┌──────────────────────────────────────┐
│           RAKKA                      │
│     Gestión ganadera                 │
│                                      │
│  Email                               │
│  [_________________________________] │
│                                      │
│  Contraseña                          │
│  [_________________________________] │
│                                      │
│  [        Ingresar        ]          │
│                                      │
│  ¿No tenés cuenta? Registrate →      │
└──────────────────────────────────────┘
```

### Campos
- **Email** * (input email)
- **Contraseña** * (input password con toggle show/hide)

### Acciones
- Botón "Ingresar" (primario, ancho completo).
- Link "¿No tenés cuenta? Registrate" → `/register`.

### Estados y errores
- **Cargando**: botón deshabilitado + spinner.
- **Error de credenciales**: mensaje inline debajo del formulario: "Email o contraseña incorrectos."
- **Campos vacíos**: validación al intentar enviar.

### Post-login
- Redirige a `/home`.
- Si el usuario no tiene establecimientos: redirige a `/establishments/new`.

---

## 3. Register (`/register`)

### Contenido del card

```
┌──────────────────────────────────────┐
│           RAKKA                      │
│     Crear cuenta                     │
│                                      │
│  Nombre completo                     │
│  [_________________________________] │
│                                      │
│  Email                               │
│  [_________________________________] │
│                                      │
│  Contraseña                          │
│  [_________________________________] │
│                                      │
│  Confirmar contraseña                │
│  [_________________________________] │
│                                      │
│  [        Crear cuenta        ]      │
│                                      │
│  ¿Ya tenés cuenta? Ingresá →         │
└──────────────────────────────────────┘
```

### Campos
- **Nombre completo** * (input texto)
- **Email** * (input email)
- **Contraseña** * (input password, mínimo 6 caracteres)
- **Confirmar contraseña** * (input password, debe coincidir)

### Acciones
- Botón "Crear cuenta" (primario, ancho completo).
- Link "¿Ya tenés cuenta? Ingresá" → `/login`.

### Estados y errores
- **Cargando**: botón deshabilitado + spinner.
- **Email ya registrado**: "Este email ya tiene una cuenta. ¿Querés ingresar?"
- **Contraseñas no coinciden**: error inline en el campo "Confirmar contraseña".
- **Contraseña muy corta**: "La contraseña debe tener al menos 6 caracteres."

### Post-registro
- Redirige a `/establishments/new` para crear el primer establecimiento.
