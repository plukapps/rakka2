# Cliente Android — Kotlin + Jetpack Compose

## Stack

- **Lenguaje**: Kotlin 1.9+
- **UI**: Jetpack Compose (Compose BOM 2024.xx.xx)
- **Async**: Coroutines + Flow
- **Arquitectura**: MVVM
- **Navegación**: Navigation Compose
- **Inyección de dependencias**: Hilt
- **Firebase SDK**: `firebase-database-ktx`, `firebase-auth-ktx`
- **Build**: Gradle con Kotlin DSL

---

## Estructura de módulos

Para MVP, un único módulo `:app`. La separación en módulos (`:core:data`, `:feature:animals`, etc.) es una mejora futura.

```
app/
├── src/main/java/com/rakka/app/
│   ├── RakkaApplication.kt          ← Inicialización de Firebase, Hilt
│   ├── MainActivity.kt              ← Single Activity, NavHost
│   │
│   ├── data/
│   │   ├── model/                   ← Data classes del dominio
│   │   │   ├── Animal.kt
│   │   │   ├── Lot.kt
│   │   │   ├── SanitaryActivity.kt
│   │   │   ├── CommercialActivity.kt
│   │   │   ├── TraceabilityEvent.kt
│   │   │   └── Alert.kt
│   │   └── repository/
│   │       ├── AnimalRepository.kt
│   │       ├── LotRepository.kt
│   │       ├── ActivityRepository.kt
│   │       ├── TraceabilityRepository.kt
│   │       └── AlertRepository.kt
│   │
│   ├── ui/
│   │   ├── navigation/
│   │   │   ├── NavGraph.kt          ← Definición de rutas
│   │   │   └── Screen.kt           ← Sealed class de rutas
│   │   ├── theme/
│   │   │   ├── Theme.kt
│   │   │   ├── Color.kt
│   │   │   └── Type.kt
│   │   └── screens/
│   │       ├── auth/
│   │       │   ├── LoginScreen.kt
│   │       │   ├── LoginViewModel.kt
│   │       │   ├── RegisterScreen.kt
│   │       │   └── RegisterViewModel.kt
│   │       ├── home/
│   │       │   ├── HomeScreen.kt
│   │       │   └── HomeViewModel.kt
│   │       ├── animals/
│   │       │   ├── AnimalListScreen.kt
│   │       │   ├── AnimalListViewModel.kt
│   │       │   ├── AnimalDetailScreen.kt
│   │       │   ├── AnimalDetailViewModel.kt
│   │       │   ├── AnimalEntryScreen.kt
│   │       │   └── AnimalEntryViewModel.kt
│   │       ├── lots/
│   │       │   ├── LotListScreen.kt
│   │       │   ├── LotListViewModel.kt
│   │       │   ├── LotDetailScreen.kt
│   │       │   └── LotDetailViewModel.kt
│   │       ├── activities/
│   │       │   ├── SanitaryActivityScreen.kt
│   │       │   ├── SanitaryActivityViewModel.kt
│   │       │   ├── CommercialActivityScreen.kt
│   │       │   └── CommercialActivityViewModel.kt
│   │       ├── traceability/
│   │       │   ├── TraceabilityScreen.kt
│   │       │   └── TraceabilityViewModel.kt
│   │       └── alerts/
│   │           ├── AlertsScreen.kt
│   │           └── AlertsViewModel.kt
│   │
│   └── di/
│       ├── FirebaseModule.kt        ← Provisión de FirebaseDatabase, FirebaseAuth
│       └── RepositoryModule.kt
│
└── src/main/res/
    └── google-services.json         ← NO commitear en producción
```

---

## Arquitectura MVVM

### Capa de datos: Repository

Cada Repository expone sus datos como `Flow<T>` usando las coroutines de Firebase:

```kotlin
class AnimalRepository @Inject constructor(
    private val database: FirebaseDatabase
) {
    fun getAnimals(estId: String): Flow<List<Animal>> = callbackFlow {
        val ref = database.getReference("animals/$estId")
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val animals = snapshot.children.mapNotNull { child ->
                    child.getValue(AnimalData::class.java)?.toAnimal(child.key!!)
                }
                trySend(animals)
            }
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        ref.addValueEventListener(listener)
        awaitClose { ref.removeEventListener(listener) }
    }

    suspend fun createAnimal(estId: String, animal: Animal): String {
        val ref = database.getReference("animals/$estId").push()
        ref.setValue(animal.toData()).await()
        return ref.key!!
    }
}
```

### Capa de ViewModel

El ViewModel expone un `UiState` como `StateFlow`:

```kotlin
data class AnimalListUiState(
    val animals: List<Animal> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
    val isOffline: Boolean = false
)

@HiltViewModel
class AnimalListViewModel @Inject constructor(
    private val animalRepository: AnimalRepository,
    private val appState: AppStateHolder  // establecimiento activo
) : ViewModel() {

    private val _uiState = MutableStateFlow(AnimalListUiState())
    val uiState: StateFlow<AnimalListUiState> = _uiState.asStateFlow()

    init {
        loadAnimals()
    }

    private fun loadAnimals() {
        viewModelScope.launch {
            appState.activeEstablishmentId.collect { estId ->
                if (estId == null) return@collect
                animalRepository.getAnimals(estId)
                    .catch { e -> _uiState.update { it.copy(error = e.message) } }
                    .collect { animals ->
                        _uiState.update { it.copy(animals = animals, isLoading = false) }
                    }
            }
        }
    }
}
```

### Capa de UI: Compose

```kotlin
@Composable
fun AnimalListScreen(
    viewModel: AnimalListViewModel = hiltViewModel(),
    onAnimalClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when {
        uiState.isLoading -> LoadingIndicator()
        uiState.error != null -> ErrorMessage(uiState.error!!)
        else -> AnimalList(
            animals = uiState.animals,
            onAnimalClick = onAnimalClick
        )
    }
}
```

---

## Navegación

```kotlin
// Screen.kt
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object AnimalList : Screen("animals")
    object AnimalDetail : Screen("animals/{animalId}") {
        fun createRoute(animalId: String) = "animals/$animalId"
    }
    object AnimalEntry : Screen("animals/new")
    object LotList : Screen("lots")
    object LotDetail : Screen("lots/{lotId}") {
        fun createRoute(lotId: String) = "lots/$lotId"
    }
    object SanitaryActivity : Screen("activities/sanitary/new")
    object CommercialActivity : Screen("activities/commercial/new")
    object Traceability : Screen("traceability/{animalId}") {
        fun createRoute(animalId: String) = "traceability/$animalId"
    }
    object Alerts : Screen("alerts")
    object Establishments : Screen("establishments")
}
```

---

## Configuración de Firebase

### `RakkaApplication.kt`

```kotlin
@HiltAndroidApp
class RakkaApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Habilitar persistencia offline (debe llamarse antes de cualquier uso del DB)
        FirebaseDatabase.getInstance().setPersistenceEnabled(true)
    }
}
```

### `FirebaseModule.kt` (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {
    @Provides @Singleton
    fun provideFirebaseDatabase(): FirebaseDatabase = FirebaseDatabase.getInstance()

    @Provides @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()
}
```

---

## Consideraciones MVP

- **Hilt** para DI: añade algo de boilerplate pero evita singletons manuales y facilita testing futuro.
- **Un solo módulo Gradle** en MVP para velocidad. La modularización viene con la escala.
- **Sin Room**: el offline lo maneja RTDB. No se duplica la base de datos local.
- **Versión mínima de Android**: API 26 (Android 8.0). Cubre ~95% de dispositivos activos.
