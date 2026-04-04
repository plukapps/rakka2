# Autenticación

## Proveedor

Firebase Authentication con email y contraseña.

---

## Flujos de usuario

### Registro

1. El usuario ingresa nombre, email y contraseña.
2. El cliente llama a `createUserWithEmailAndPassword(email, password)`.
3. Firebase Auth crea el usuario y devuelve el `uid` + token JWT.
4. El cliente escribe el perfil inicial en `/users/{uid}`:
   ```json
   {
     "name": "Nombre ingresado",
     "email": "email@example.com",
     "establishmentIds": {},
     "createdAt": <timestamp>
   }
   ```
5. El cliente redirige al flujo de onboarding (crear primer establecimiento).

### Login

1. El usuario ingresa email y contraseña.
2. El cliente llama a `signInWithEmailAndPassword(email, password)`.
3. Firebase Auth devuelve el token JWT.
4. El cliente lee `/users/{uid}` para cargar el perfil y la lista de establecimientos.
5. Si tiene establecimientos, navega a la home con el primero como activo. Si no tiene, navega a onboarding.

### Logout

1. El cliente llama a `signOut()`.
2. Se limpia el estado local del usuario y el establecimiento activo.
3. Se navega a la pantalla de login.
4. El SDK de RTDB detiene los listeners activos.

> **Importante en offline**: el SDK de RTDB persiste el token y los datos localmente. El usuario puede usar la app sin conexión aunque haya cerrado y reabierto la app, siempre que no haya hecho logout explícito.

### Recuperación de contraseña

1. El usuario ingresa su email en la pantalla "olvidé mi contraseña".
2. El cliente llama a `sendPasswordResetEmail(email)`.
3. Firebase envía el email de recuperación. El cliente muestra confirmación.

---

## Sesión y tokens

- Firebase Auth maneja automáticamente el **refresh del token JWT** (expira cada hora, se renueva en segundo plano).
- El cliente no gestiona tokens manualmente: usa el `currentUser` del SDK, que siempre tiene un token válido cuando hay conexión.
- En offline, el SDK usa el token cacheado. Las Security Rules de RTDB se evalúan con el token al momento de la escritura (online) o se validan al sincronizar.

---

## Relación Auth ↔ RTDB

```
Firebase Auth
  uid: "user_abc123"
  email: "juan@example.com"
       │
       ▼
/users/user_abc123
  name: "Juan"
  email: "juan@example.com"
  establishmentIds: { "est_111": true }
```

- El `uid` generado por Firebase Auth es la clave primaria en `/users/`.
- Las Security Rules de RTDB validan que `auth.uid` coincida con el propietario de los recursos accedidos.

---

## Security Rules de RTDB

Las reglas garantizan que cada usuario solo accede a sus propios datos.

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "establishments": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": "auth != null && (
          !data.exists() ||
          root.child('establishments').child($estId).child('ownerId').val() === auth.uid
        )"
      }
    },
    "animals": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid"
      }
    },
    "lots": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid"
      }
    },
    "lot_animals": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid"
      }
    },
    "activities": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid"
      }
    },
    "traceability": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": false
      }
    },
    "alerts": {
      "$estId": {
        ".read": "auth != null && root.child('establishments').child($estId).child('ownerId').val() === auth.uid",
        ".write": false
      }
    }
  }
}
```

> **Nota**: `traceability` y `alerts` son de **solo lectura para el cliente**. Solo las Cloud Functions pueden escribir en esos nodos (las Functions usan el Admin SDK, que omite las Security Rules).

---

## Consideraciones de seguridad

- Las contraseñas las gestiona Firebase Auth directamente: nunca se almacenan en RTDB.
- El email se guarda en `/users/{uid}/email` solo para mostrarlo en el perfil del usuario. Firebase Auth es la fuente de verdad del email.
- No hay lógica de roles en el MVP: las Security Rules validan únicamente que el usuario autenticado es el propietario del establecimiento.
