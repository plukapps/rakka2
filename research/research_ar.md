# Research de mercado — Argentina (Gestión Ganadera)

**Fecha:** 2026-04-05

---

## Contexto del mercado

- ~54 millones de cabezas de ganado, uno de los mayores productores de carne del mundo
- Regulado por SENASA
- Trazabilidad electrónica individual: en expansión pero no obligatoria para todas las categorías
- ~200.000+ establecimientos ganaderos
- Fuerte cultura de grupos CREA (consorcios de productores)
- Alta adopción de IATF (Inseminación Artificial a Tiempo Fijo)
- Sector feedlot en crecimiento (~40% del ganado se termina en feedlot)
- Conectividad rural pésima — offline es crítico

---

## Regulación clave

| Sistema | Qué es |
|---------|--------|
| **SENASA** | Organismo regulador sanitario |
| **RENSPA** | Registro Nacional Sanitario de Productores Agropecuarios |
| **DT-e** | Documento de Tránsito electrónico — obligatorio para todo movimiento |
| **TAD** | Trámites a Distancia — portal web de SENASA para gestiones |
| **Caravana SENASA** | Tag visual oficial obligatorio |
| **Vacunación Aftosa** | Obligatoria bi-anual, gestionada por fundaciones ganaderas locales |

---

## Competidores en Argentina

### 1. Tambero.com (Líder del mercado)
- **Origen**: Córdoba, Argentina
- **Qué hace**: Gestión integral — herd tracking, reproducción, sanidad, peso, producción lechera
- **Pricing**: Freemium. Free básico, pagos ~$15-50 USD/mes
- **Target**: Operaciones chicas a grandes, dairy y beef
- **Usuarios**: Dice tener 100.000+ en LATAM
- **Fortalezas**: Mayor base de usuarios, multi-plataforma, UI simple
- **Debilidades**:
  - Origen dairy (se nota en el producto)
  - Integración SENASA básica
  - Sync offline poco confiable
  - Interfaz se siente anticuada
  - No maneja IATF bien
- **Conclusión**: Es el líder pero vulnerable. Una app moderna con mejor UX, offline real y IATF puede competirle.

### 2. Agrobit
- **Origen**: Argentina
- **Qué hace**: Plataforma de agricultura de precisión con módulos ganaderos
- **Target**: Operaciones medianas a grandes, agricultura + ganadería
- **Fortalezas**: Imágenes satelitales, tracking financiero
- **Debilidad**: Ganadería es secundaria a agricultura. No es livestock-first.

### 3. Infortambo
- **Origen**: Argentina
- **Qué hace**: Software específico para tambos (dairy)
- **Relevancia**: Solo dairy, no aplica a carne

### 4. GestAgro
- **Origen**: Argentina
- **Qué hace**: Gestión de campo con módulos ganaderos y agrícolas
- **Target**: Operaciones mixtas medianas a grandes
- **Fortalezas**: Tracking financiero, gestión de stock
- **Debilidad**: Desktop-first, experiencia mobile pobre

### 5. CREA / ProCarne
- **Tipo**: Herramientas internas de la red CREA
- **Qué hace**: Gestión + benchmarking entre miembros CREA
- **Acceso**: Solo miembros CREA (~2.000 miembros con ganadería significativa)
- **Fortalezas**: Define el estándar de "buena gestión". Índices productivos, comparación entre pares.
- **Relevancia**: No es competencia directa pero influye en qué features valoran los productores top.

### 6. Cattler
- **Origen**: Argentina, startup
- **Qué hace**: Gestión ganadera mobile-first
- **Penetración**: Limitada
- **Info disponible**: Escasa

### 7. SENASA Digital (TAD / SIGSA)
- **Tipo**: Plataforma gobierno
- **Qué hace**: DT-e, trámites sanitarios, RENSPA
- **Problema**: Complejo, burocrático, pésima UX, requiere muchos pasos para operaciones comunes
- **Oportunidad para Rakka**: ENORME — cualquier simplificación de la interacción con SENASA es de altísimo valor.

### 8. Soluciones feedlot
- Varios feedlots usan software a medida o semi-custom
- No hay un producto dominante
- **Necesidades**: Formulación de dietas, costo por kg ganado, gestión de corrales, tracking de consumo

---

## Gaps del mercado argentino

| Gap | Situación actual | Oportunidad |
|-----|-------------------|-------------|
| **Automatización DT-e SENASA** | Todos usan TAD manualmente | Pre-llenar desde la app, reducir errores |
| **Calendario IATF** | Excel/papel | Protocolo paso a paso con alertas |
| **Módulo feedlot** | Soluciones custom, no hay app dominante | Dieta, costo/kg, gestión de corrales |
| **Reportes PDF/Excel** | Creación manual | Auto-generación desde datos de la app |
| **Peso/GDP completo** | Tambero tiene básico, otros nada | GDP + proyección + curvas |
| **Benchmarking tipo CREA** | Solo herramientas internas CREA | Plataforma abierta de benchmarking |
| **Doble moneda (USD/ARS)** | Ninguna app lo maneja bien | Módulo financiero con ambas monedas |
| **Portal veterinario multi-cliente** | Ninguna app lo ofrece | Vets como canal de distribución |

---

## Features específicas para Argentina

### Must-have

| Feature | Por qué |
|---------|---------|
| **SENASA / DT-e** | Todo movimiento requiere DT-e. Auto-generar datos = ahorro masivo de tiempo |
| **IATF** | Argentina es líder mundial en adopción de IATF. Nadie lo resuelve bien en una app |
| **Doble moneda** | Los productores piensan en USD pero operan en ARS. Volatilidad extrema |
| **Offline real** | Conectividad rural argentina es pésima. Esto es make-or-break |
| **Vacunación aftosa** | Obligatoria bi-anual. Tracking de cumplimiento |

### Alta diferenciación

| Feature | Por qué |
|---------|---------|
| **Módulo feedlot** | 40% del ganado se termina en feedlot. Dietas, costo/kg, corrales. Segmento en crecimiento, no hay app dominante |
| **Benchmarking productivo** | Los grupos CREA valoran comparar índices. Una versión abierta sería potente |
| **Portal veterinario** | Vets atienden múltiples clientes. Si un vet con 30 clientes adopta = 30 establecimientos |
| **Integración con sociedades de raza** | AAA (Angus), AHA (Hereford), Braford, Brangus. EPD data y registros |
| **Integración consignatarios / remates** | Canal de venta tradicional argentino. Listar animales desde la app |

### Por región

| Región | Características | Features relevantes |
|--------|----------------|---------------------|
| **Pampa Húmeda** | Intensivo, feedlot, alta tecnología | Feedlot module, peso/GDP, financiero |
| **NEA/NOA** | Extensivo, cría, peor conectividad | Offline robusto, IATF, carga animal |
| **Patagonia** | Ovinos + bovinos, extensivo | Módulo ovino, mapeo de campos |
| **Cuyo** | Mixto, engorde a corral | Feedlot, financiero |

---

## Oportunidad para Rakka

1. **Tambero es el líder pero es vulnerable** — interfaz anticuada, origen dairy, offline poco confiable. Una app moderna con mejor UX puede competir.
2. **Nadie es dueño de la integración SENASA** — es la oportunidad más grande del mercado.
3. **IATF es un need no atendido** único del mercado argentino/LATAM.
4. **El segmento feedlot está creciendo y desatendido** por apps modernas.
5. **Los CREA son early adopters y líderes de opinión** — targetearlos da credibilidad (si un CREA adopta Rakka, otros productores siguen).
6. **El foco de Rakka en RFID está bien tirado** — Argentina avanza hacia trazabilidad electrónica obligatoria.
7. **Doble moneda es table-stakes** para cualquier módulo financiero en Argentina.
8. **El veterinario como usuario/canal** es una estrategia de go-to-market no explorada por ningún competidor.
