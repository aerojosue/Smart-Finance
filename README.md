# Smart Finance JS

**Aplicación web de finanzas personales multimoneda** pensada para personas que manejan cuentas, tarjetas y flujos de dinero en distintos países (ejemplo: Argentina, Brasil y Estados Unidos).  

## 🚀 Objetivos principales
- Centralizar **ingresos, gastos y deudas** en múltiples monedas.  
- Administrar **tarjetas de crédito/débito** (fechas de corte, días de pago, cuotas).  
- Registrar **ingresos** en distintas monedas con distintos niveles de certeza.  
- Registrar **conversiones de moneda** (ej. BRL → ARS) y calcular spreads entre tasa estimada y efectiva.  
- Generar un **flujo de caja proyectado a 90 días**, destacando déficits de liquidez por moneda.  
- Notificar al usuario de **vencimientos de pagos** con antelación (7/3/1 días).  

---

## 🧩 Funcionalidades

### 1. Gastos
- Registro de gasto: tipo (débito/crédito), tarjeta asociada, cuotas, categoría, moneda, valor, concepto opcional.  
- Si es en otra moneda, cálculo automático del equivalente en la moneda principal.  

### 2. Ingresos
- Fecha de depósito, banco/cuenta, categoría, moneda, valor.  
- Nivel de confianza: alto / medio / bajo.  

### 3. Tarjetas
- Banco, monedas soportadas, límite de crédito, fecha de corte, fecha de pago, color identificador.  

### 4. Cuentas
- Tipos: efectivo, cuentas bancarias (ARS/USD/BRL), billeteras virtuales, crypto.  
- Cada cuenta con su moneda y saldo.  

### 5. Conversión de moneda (FX)
- Registro: fecha, moneda origen, monto origen, moneda destino, monto destino, plataforma, tasa estimada vs real.  
- Cálculo de spreads y análisis posterior.  

### 6. Dashboard
- KPIs: ingresos del mes, gastos del mes, saldos por moneda, crédito disponible.  
- Gráficos de categorías.  
- Lista de déficits previstos.  
- Flujo de caja de 90 días.  

### 7. Calendario (90 días)
- Vista de 3 meses (mes actual + 2).  
- Cuotas pendientes, ingresos esperados, déficits proyectados.  
- Estados: upcoming, warning, urgent, due, paid.  

### 8. Detalle de cuota
- Monto base, déficit calculado, sugerencias de cobertura.  
- Opciones: marcar como pagada o generar conversión.  

### 9. Notificaciones
- Centro de notificaciones in-app.  
- Alertas 7/3/1 días antes de pagos.  
- Estado destacado para cuotas vencidas.  

---

## 🛠️ Stack técnico
- **Frontend:** React con Tailwind  
- **Bundler:** Vite (actual), pensado para migrar a Next.js si se deploya en Vercel  
- **Estructura modular:**  
  - `public/mocks` → JSON de prueba (dashboard, calendario, cuotas, FX, settings)  
  - `src/lib` → helpers para leer mocks (`mockApi.ts`)  
  - `src/components` → UI modular (`DeficitsList`, `Calendar90d`, `InstallmentDetail`, `FxForm`, `NotificationsCenter`)  
  - `src/App.tsx` → demo principal en Vite  
- **Base de datos:** aún no definida, se usan mocks como API simulada.  

---

## 🗓️ Roadmap MVP
- ✅ Mock de KPIs, calendario, cuota e instalación inicial.  
- 🔜 Modal de Pago (marcar cuotas como pagadas).  
- 🔜 Drawer de Detalle del Día (ver obligaciones/ingresos por fecha).  
- 🔜 Persistencia en IndexedDB o Supabase.  
- 🔜 Export a Google Sheets o CSV.  

---

## ▶️ Cómo correr local
```bash
# Instalar dependencias
npm install

# Correr servidor dev
npm run dev

# Abrir en el navegador (por defecto)
http://localhost:5173
