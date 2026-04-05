# Research de mercado — Rakka (Gestión Ganadera)

**Fecha:** 2026-04-05

---

## Competencia relevante

| App | Origen | Foco |
|-----|--------|------|
| **Tambero** | Argentina | Muy popular en LATAM, freemium, dairy + beef |
| **BovControl** | Brasil/Global | Mobile-first, fuerte en LATAM, usado por ONGs y grandes operaciones |
| **AgriWebb** | Australia | Cloud, analytics fuertes, adquirido por Elanco en 2023 |
| **CattleMax** | US | Desktop + mobile, cow-calf operations |
| **Herd Boss** | US | Mobile-first, simple, pymes ganaderas |
| **Datamars/Tru-Test** | NZ | Hardware + software (balanzas, lectores RFID) |
| **Agrobit** | Argentina | Agricultura de precisión, algunos módulos ganaderos |

---

## Qué tiene Rakka hoy

Registro de animales con RFID, gestión de lotes, actividades (sanitaria, comercial, campo, movimiento, reproducción, general), trazabilidad, alertas, establecimientos, offline-first.

**Lo que falta vs. la competencia:**
1. Sin dimensión financiera (costos, precios, márgenes)
2. Sin tracking de peso/ganancia diaria (GDP)
3. Sin gestión de protocolos reproductivos (IATF)
4. Sin dimensión espacial (potreros, mapas)
5. Sin reportes/exportación (PDF, Excel)

---

## Features candidatas — Next Steps

### Tier 1: Alto impacto, esfuerzo moderado

#### 1. Gestión de protocolos IATF
- Calendario de protocolo paso a paso (Día 0: insertar dispositivo, Día 8: retirar + inyectar, Día 10: IA)
- Alertas por paso del protocolo
- Dashboard de resultados por protocolo
- **Por qué**: IATF es ubicuo en Argentina y ninguna app lo resuelve bien. Los veterinarios lo manejan en planillas de Excel.

#### 2. Tracking de peso y ganancia diaria (GDP)
- Registro de pesajes por animal/lote
- Cálculo automático de GDP (ganancia diaria de peso)
- Curvas de crecimiento visual
- Proyección: "Este lote llega a 450kg en ~35 días al ritmo actual"
- Integración con balanzas Bluetooth (Tru-Test, Gallagher)
- **Por qué**: El peso es LA métrica de revenue en ganadería de carne. Todo gira alrededor de kg producidos por día.

#### 3. Módulo financiero básico
- Costo por cabeza (alimentación, sanidad, mano de obra)
- Registro de precio de compra/venta, cálculo de margen
- Tracking en pesos y dólares (crítico para Argentina)
- P&L por lote
- **Por qué**: Las apps que ganan son las que pasan de "libreta digital" a "herramienta de decisión". Saber el costo real por kg es lo que define cuándo vender.

#### 4. Generación de reportes PDF
- Reporte de stock por categoría
- Resumen de actividades por período
- Reporte de trazabilidad por animal
- Exportable para contadores, bancos, SENASA, asociaciones de raza
- **Por qué**: Los datos entran pero no salen en formato profesional. Un PDF prolijo construye confianza y valor percibido.

---

### Tier 2: Alto impacto, esfuerzo alto

#### 5. Mapeo de potreros + rotación de pastoreo
- Mapa satelital, dibujar potreros con GPS
- Asignar lotes a potreros
- Planificación visual de rotación (calendario)
- Cálculo de carga animal (UGM/ha)
- Estimación de forraje con NDVI satelital
- **Por qué**: En sistemas pastoriles extensivos (dominante en Argentina), el manejo de pasturas ES el negocio.

#### 6. Integración con SENASA (DT-e)
- Auto-generación de datos para Documento de Tránsito electrónico
- Gestión de RENSPA
- Generación de datos para declaraciones de stock
- **Por qué**: El dolor burocrático es el #1 queja de productores argentinos. Ninguna app lo resuelve. Automatizar esto sería un game-changer.

#### 7. Portal veterinario multi-cliente
- Veterinario ve todos sus establecimientos-cliente en una app
- Permisos por rol (dueño, encargado, veterinario, peón)
- Asignación de tareas a trabajadores
- Feed de actividad / audit log
- **Por qué**: El veterinario como usuario es un canal de adquisición potente. Un vet con 30 clientes que adopta la app puede traer 30 establecimientos.

---

### Tier 3: Impacto medio, esfuerzo bajo

#### 8. Integración con clima
- Forecast local para la ubicación del campo
- Registro de lluvias (manual o automático)
- Alertas de estrés térmico
- **Por qué**: Simple API, uso diario, agrega valor inmediato.

#### 9. Dashboard con KPIs
- Tasa de preñez, tasa de mortalidad, stock por categoría
- Carga animal (UGM/ha)
- Agregaciones de datos que ya se recolectan
- Comparativo entre lotes, períodos o establecimientos
- **Por qué**: Convertir datos en decisiones. "¿Qué lote debería vender?" se responde con un dashboard.

#### 10. Alertas vía WhatsApp
- Reenviar alertas críticas por WhatsApp
- Quick-entry de datos desde WhatsApp
- **Por qué**: WhatsApp es la app #1 en Argentina. Esfuerzo bajo, valor percibido alto.

---

### Tier 4: Innovación / diferenciación futura

| Feature | Qué es | Madurez |
|---------|--------|---------|
| **IA para Body Condition Score** | Scoring automático por cámara/foto | Emergente (CattleEye, Cainthus) |
| **Monitoreo satelital de pasturas** | NDVI para estimar biomasa y tasa de crecimiento | Disponible (Pasture.io, AgriWebb) |
| **Blockchain de trazabilidad** | Cadena de custodia inmutable para carne premium/export | Pilotos en Brasil |
| **Créditos de carbono** | Tracking de secuestro de carbono para mercado de créditos | Emergente (AgriWebb) |
| **Integración con drones** | Conteo de hacienda, inspección de alambrados, monitoreo de agua | Emergente |
| **Marketplace integrado** | Listar animales a la venta desde la app | Maduro en AU (AuctionsPlus) |
| **Detección de celo con sensores** | Collares/caravanas con acelerómetro | Maduro en dairy, emergente en beef |

---

## Insight principal

Las apps ganaderas que ganan son las que pasan de ser una **"libreta digital"** (registrar lo que pasó) a ser una **herramienta de decisión** (ayudar a decidir qué hacer).

Las preguntas que el productor necesita responder:
- "¿Cuál lote debería vender?" → requiere GDP + costos
- "¿Este toro se está pagando?" → requiere reproducción + financiero
- "¿Cuándo llega el lote 3 al peso objetivo?" → requiere tracking de peso
- "¿Estoy sobrecargando este potrero?" → requiere mapeo + carga animal

Rakka tiene la base sólida. El salto de valor está en las capas de **peso, dinero, reproducción avanzada y reportes**.
