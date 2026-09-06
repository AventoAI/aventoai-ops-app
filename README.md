# 🦉 AventoAI Ops Hub

> **Sistema Centralizado de Gestión Operativa, Asignación de Recursos y Disponibilidad Horaria de AventoAI**

![AventoAI Logo](https://img.shields.io/badge/AventoAI-Ops%20Hub-0077FF?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

---

## 📌 1. Visión General del Proyecto

**AventoAI Ops Hub** es la plataforma interna desarrollada para coordinar, optimizar y visibilizar la carga operativa, disponibilidad de horarios y compromisos de trabajo de los **7 socios principales de AventoAI**. 

El sistema resuelve la complejidad de coordinar horarios parciales, priorizar proyectos estratégicos (como **MindConnect**, **CRM AventoAI** y las **Mejoras de la Landing Page de AventoAI**), gestionar ausencias/reposiciones en fin de semana y alertar automáticamente cuellos de botella que superen las 48 horas de inactividad.

---

## 🎨 2. Identidad Visual y Experiencia de Usuario (UX/UI)

La interfaz de usuario hereda estrictamente la estética del ecosistema visual oficial de AventoAI ([landing-AventoAI](file:///Users/joseguillermopauldiaz/Developments/landing-AventoAI)):

- **Paleta de Colores Oficial**:
  - `Fondo Principal`: `#020817` (Midnight Dark).
  - `Tarjetas / Paneles`: `#080E1E` (Card Navy translúcido con efecto glassmorphism `backdrop-blur-xl`).
  - `Azul Eléctrico (Primary)`: `#0077FF` (Bordes interactivos, acentos y resplandores).
  - `Cian Neón (Accent Glow)`: `#00F0FF` (Acentos destacados y badges).
  - `Ámbar Alerta`: `#F59E0B` (Compromisos de reposición de tiempo y tareas en riesgo).
  - `Carmesí Crítico`: `#EF4444` (Cuellos de botella >48h).
- **Patrón de Fondo y Malla Neón**:
  - Rejilla retroiluminada de 40px (`bg-grid-pattern`) con orbes radiales orgánicos cyan y azul (`bg-mesh-orbs`).
- **Logotipo e Iconografía**:
  - Logotipo oficial de AventoAI (`aventoai-logo.jpg`) incorporado en el Header principal con halo radiante cian y asignado como `favicon.ico`.
- **Efectos y Animaciones**:
  - Animación sutil de plumas de búho cayendo (`FallingFeathers.tsx`), simulando el plumaje místico del búho AventoAI.
  - Indicador del selector de fecha/hora (`datetime-local`) personalizado en blanco (`filter: invert(1)`) para óptima visibilidad en modo oscuro.
- **Diseño 100% Responsivo**:
  - Pistas visuales adaptables para dispositivos móviles, tablets y monitores desktop de alta resolución.

---

## ⚙️ 3. Reglas de Negocio Operativas y Distribución Horaria

### ⏱️ Compromiso Horario Total: **110 Horas / Semana**

El equipo de socios opera bajo un esquema flexible de horas semanales dedicadas, asegurando que cada proyecto estratégico cuente con el recurso especializado adecuado:

| Socio | Rol Principal | Horas / Sem | Proyectos Asignados & Dedicación |
| :--- | :--- | :---: | :--- |
| **José Guillermo Paúl Díaz** | Founder / CEO & Tech Lead | **20 h** | Arquitectura general, MindConnect, CRM y estrategia general de AventoAI. |
| **Anderson** | Lead UI/UX Designer | **16 h** | Diseño UI/UX completo de MindConnect, branding, prototipado y despliegues CRM. |
| **Sebastián Martínez** | Lead Fullstack Engineer | **16 h** | **12h** Desarrollo backend/core de MindConnect + **4h** dedicadas exclusivamente a las **Mejoras de la Landing Page de AventoAI**. |
| **Felipe Barrera** | Senior Fullstack Engineer | **12 h** | Integraciones, APIs y microservicios para MindConnect y CRM. |
| **Brayan Vera** | Fullstack Engineer | **16 h** | Módulos del CRM AventoAI y funcionalidades clave de MindConnect. |
| **Mateo** | Fullstack Developer | **16 h** | Soporte técnico, desarrollo frontend y mantenimiento continuo. |
| **Juan** | Operations & QA Lead | **14 h** | Control de calidad, auditoría UX/UI, pruebas e integración continua. |

---

### 📅 Reglas de Disponibilidad Horaria y Reposición de Tiempo

1. **Matriz de Disponibilidad Semanal**:
   - Cada socio configura sus franjas horarias operativas de Lunes a Viernes.
   - Las horas semanales registradas deben coincidir exactamente con el compromiso acordado.
2. **Gestión de Novedades y Ausencias**:
   - **Asunto Personal / Salida**: Requiere obligatoriamente programar un bloque de reposición en fin de semana (Sábados 8:00 AM - 12:00 PM, 2:00 PM - 6:00 PM, o Domingos 9:00 AM - 1:00 PM).
   - **Emergencia Familiar / Salud**: Novedad justificada registrada en el historial del equipo.
3. **Control de Cuellos de Botella (>48 Horas)**:
   - Toda tarea o requerimiento estancado por más de 48 horas dispara una alerta roja en el tablero.
   - Cuenta con una acción directa para enviar notificación formal vía correo electrónico a la dirección de coordinación (`pauldiazjoseguillermo@gmail.com`) y diseño/despliegues (`andolon.dmso@gmail.com`).

---

## 🏗️ 4. Arquitectura de Software y Componentes

```
aventoai-ops-app/
├── public/
│   ├── aventoai-logo.jpg       # Logotipo oficial de AventoAI
│   └── favicon.svg             # Favicon del navegador
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Encabezado principal con logo, badge de estatus y perfil
│   │   ├── AvailabilityMatrix.tsx # Matriz responsiva de días y franjas de disponibilidad
│   │   ├── ProjectAllocation.tsx  # Tarjetas de asignación de horas y proyectos por socio
│   │   ├── MakeupsTracker.tsx     # Formulario de novedades e historial de reposiciones
│   │   ├── BottlenecksList.tsx    # Alertas >48h y modal de confirmación / envío de correo
│   │   └── FallingFeathers.tsx    # Animación de plumas de búho cayendo en el fondo
│   ├── lib/
│   │   └── supabase.ts          # Cliente e interfaces TypeScript para Supabase
│   ├── App.tsx                  # Navegación por pestañas y maquetación principal
│   ├── index.css                # Estilos Tailwind CSS, animaciones y filtros del picker
│   └── main.tsx                 # Punto de entrada de React 18
├── supabase/
│   └── schema.sql               # Script DDL completo de PostgreSQL para Supabase
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🗄️ 5. Esquema de Base de Datos (Supabase PostgreSQL)

El proyecto incluye la definición completa de base de datos en `supabase/schema.sql`:

- `partners`: Perfiles de socios (ID, nombre, correo, horas requeridas, rol).
- `availabilities`: Franjas de trabajo por día de la semana (`day_of_week`, `start_time`, `end_time`).
- `project_allocations`: Distribución horaria por proyecto (`project_name`, `hours_allocated`).
- `absence_makeups`: Registro de ausencias y bloques de reposición en fin de semana.
- `bottlenecks`: Registro de tareas bloqueadas (>48h) con indicador de notificación enviada.

---

## 🚀 6. Instalación y Ejecución Local

### Requisitos Previos
- **Node.js**: v18.0.0 o superior.
- **npm**: v9.0.0 o superior.

### Pasos de Instalación

1. **Clonar / Ubicar el repositorio**:
   ```bash
   cd /Users/joseguillermopauldiaz/Developments/aventoai-ops-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno (Opcional para Supabase)**:
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

4. **Iniciar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

5. **Compilar para Producción**:
   ```bash
   npm run build
   ```

---

## ✒️ Créditos y Propiedad

Desarrollado para **AventoAI** por el equipo de ingeniería e Inteligencia Artificial.
Todos los derechos reservados © 2026 AventoAI.
