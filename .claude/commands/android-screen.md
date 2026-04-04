# Scaffold Android Screen

Crea una nueva pantalla Android para el feature: $ARGUMENTS

Seguir exactamente la arquitectura definida en `specs/technical/07-cliente-android.md`:

1. **`XxxUiState`** — data class con los campos necesarios para renderizar la UI
2. **`XxxViewModel`** — `@HiltViewModel`, expone `StateFlow<XxxUiState>`, llama al Repository correspondiente
3. **`XxxScreen`** — `@Composable`, recibe el ViewModel via `hiltViewModel()`, observa con `collectAsStateWithLifecycle()`

Ubicar en `code/android-app/src/main/java/com/rakka/app/ui/screens/<feature>/`.

No agregar lógica de negocio en el ViewModel — solo transformación de datos para UI.
No agregar navegación hardcodeada — usar el callback de navegación como parámetro.
