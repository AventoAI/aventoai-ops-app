# 🦉 Reglas de Gobernanza y Directrices del Proyecto - AventoAI Ops Hub

Este documento define las políticas de gobernanza, estándares técnicos, reglas de negocio y flujos de trabajo que cualquier agente de IA (Gemini / Antigravity) o desarrollador debe respetar al operar en el repositorio **aventoai-ops-app**.

---

## 1. 📋 Resumen del Proyecto y Rol del Agente

- **Proyecto**: AventoAI Ops Hub
- **Objetivo**: Sistema centralizado de gestión operativa, asignación de recursos y disponibilidad horaria de los 7 socios principales de AventoAI.
- **Rol del Asistente**: Actuar como un ingeniero Fullstack Senior especializado en React, TypeScript y Tailwind CSS, garantizando coherencia con el diseño de AventoAI, solidez en las reglas de negocio y máxima calidad de código.

---

## 2. 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript (5.x, configuración estricta), Vite 5.
- **Estilos & UI**: Tailwind CSS 3.4, Lucide React (iconografía), PostCSS, Autoprefixer.
- **Backend / Persistencia**: Supabase (`@supabase/supabase-js`, PostgreSQL).
- **Entorno de Ejecución**: Node.js >= 18, npm >= 9.

---

## 3. 🎨 Sistema de Diseño e Identidad Visual (AventoAI Design System)

Toda modificación visual debe adherirse estrictamente al lenguaje visual de AventoAI:

### Paleta de Colores Oficial
- **Fondo Base (Midnight Dark)**: `#020817` (`bg-[#020817]`).
- **Superficie de Tarjetas (Card Navy)**: `#080E1E` con soporte de Glassmorphism (`bg-[#080E1E]/80 backdrop-blur-xl border border-slate-800/80`).
- **Azul Primario (Electric Blue)**: `#0077FF` (`text-[#0077FF]`, `border-[#0077FF]`, `bg-[#0077FF]`).
- **Acento Neón (Cyan Glow)**: `#00F0FF` (`text-[#00F0FF]`, acentos y badges de resplandor).
- **Advertencia / Reposición (Ámbar)**: `#F59E0B`.
- **Alerta Crítica / Cuello de Botella (Carmesí)**: `#EF4444`.

### Componentes y Efectos
- Mantener los fondos de malla y orbes (`bg-grid-pattern`, `bg-mesh-orbs`).
- Conservar los detalles de microinteracciones y efectos temáticos (ej. `FallingFeathers.tsx`).
- Asegurar visibilidad accesible en modo oscuro (como los selectores con filtro invertido para `datetime-local`).
- Diseño 100% responsivo para móviles, tablets y pantallas de escritorio.

---

## 4. ⚙️ Reglas de Negocio y Lógica Operativa

Cualquier cambio que afecte la lógica debe validar:

1. **Compromiso Horario (110 h / semana en total)**:
   - José Guillermo Paúl Díaz: 20 h
   - Anderson: 16 h
   - Sebastián Martínez: 16 h (12h MindConnect + 4h Landing Page)
   - Felipe Barrera: 12 h
   - Brayan Vera: 16 h
   - Mateo: 16 h
   - Juan: 14 h
2. **Validación de Matriz**:
   - Las horas semanales configuradas por socio deben cuadrar exactamente con su compromiso contractual/operativo.
3. **Novedades y Reposiciones**:
   - Ausencias por motivos personales exigen registrar franja de reposición en fin de semana:
     - Sábados: 8:00 AM - 12:00 PM o 2:00 PM - 6:00 PM.
     - Domingos: 9:00 AM - 1:00 PM.
4. **Detección de Cuellos de Botella (>48 Horas)**:
   - Bloqueos de más de 48h deben activar bandera crítica y preparar notificación hacia `pauldiazjoseguillermo@gmail.com` y `andolon.dmso@gmail.com`.

---

## 5. 💻 Estándares de Arquitectura y Buenas Prácticas de Código

- **Estructura Modular**:
  - `src/components/`: Componentes UI reutilizables y atómicos.
  - `src/lib/`: Conexiones externas, clientes SDK y tipados compartidos (`supabase.ts`).
  - `supabase/`: Definiciones DDL y esquemas SQL (`schema.sql`).
- **TypeScript Estricto**:
  - Declarar interfaces o tipos explícitos para props, estados y modelos de datos.
  - Prohibido el uso indiscriminado de `any`.
  - Reutilizar las interfaces de base de datos declaradas en `src/lib/supabase.ts`.
- **Integridad del Código**:
  - No eliminar comentarios explicativos, docstrings o bloques de documentación existentes sin justificación expresa.
  - Mantener nombres claros en español para el contexto de negocio de AventoAI cuando corresponda, o camelCase estándar en código TypeScript.

---

## 6. 🔒 Seguridad y Manejo de Entorno

- **Cero Credenciales en Código**: Nunca almacenar llaves de servicio de Supabase (`service_role`) en el frontend o archivos públicos.
- **Variables de Entorno**: Solo utilizar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` expuestas vía `import.meta.env`.
- Archivos `.env`, `.env.local` y configuraciones locales deben permanecer en `.gitignore`.

---

## 7. 🚀 Comandos de Verificación y Compilación

Antes de finalizar cambios relevantes, verificar que el proyecto compila y no introduce errores de tipos:

```bash
# Desarrollo local
npm run dev

# Verificación de tipos y compilación de producción
npm run build
```

---

## 8. 📝 Políticas de Git y Convenciones de Commits

Al redactar y generar commits para este repositorio, el agente debe seguir estrictamente el siguiente procedimiento:

1. **Inspección Previa**:
   - Siempre revisar previamente los cambios en el *staged changes* (`git diff --cached` o `git status`).
2. **Idioma y Tono**:
   - Redactar en **español**, de forma concisa, profesional y descriptiva.
3. **Estructura Requerida**:
   ```text
   <tipo>: :<emoji_gitmoji>: "<título corto del commit>

   <cuerpo o descripción más amplia del cambio>

   <adicionales / notas de breaking changes o referencias de tareas>"
   ```

### Ejemplos de Tipos y Gitmojis:
- `feat: :sparkles:` o `feat: :construction:` para nuevas funcionalidades o trabajos en curso.
- `fix: :bug:` para correcciones de errores o bugs.
- `style: :art:` o `style: :lipstick:` para ajustes de interfaz y estilos visuales.
- `refactor: :recycle:` para refactorizaciones sin alterar comportamiento.
- `docs: :memo:` para documentación y archivos markdown.
- `chore: :wrench:` para ajustes de configuración o dependencias.
