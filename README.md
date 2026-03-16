<div align="center">

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" width="60px"/>

# ⚔️ POKÉMON AÑIL TRACKER

### *"Un Nuzlocke compartido. Un destino vinculado."*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=flat-square)]()
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=flat-square)]()
[![Versión](https://img.shields.io/badge/Versión-1.0.0-red?style=flat-square)]()

<br/>

🔗 **[Ver la app en vivo →](https://indigo-run-log.lovable.app)**

</div>

---

## 📖 ¿Qué es Pokémon Añil Tracker?

Tracker colaborativo en **tiempo real** para grupos de amigos que juegan runs de **Nuzlocke** y **Soul Link** juntos. Registra capturas ruta por ruta, vincula Pokémon entre compañeros y recibe una notificación cuando el destino actúe — porque en el Soul Link, ninguno cae solo.

<div align="center">

```
🎮 Jugador 1          💀 Ruta 3          🎮 Jugador 2
  Charizard    ══════ Soul Link ══════   Blastoise
     ❌ muere                              ❌ también muere
```

</div>

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### ✅ Disponible ahora
- 📍 Registro de capturas por ruta
- 🔗 Vinculación Soul Link entre jugadores
- 💀 Muerte en cadena automática
- 📡 Notificaciones en tiempo real
- 📜 Log de eventos de la run
- 📕 Pokédex de capturas personal
- 👥 Modo multijugador

</td>
<td width="50%">

### 🔜 Próximamente
- 🗺️ Mapa de progreso por región
- 📊 Estadísticas detalladas de la run
- ⚙️ Reglas personalizadas por partida
- 🪦 Cementerio de caídos
- 🔒 Modo espectador (solo lectura)
- 🏆 Exportar resumen de la run

</td>
</tr>
</table>

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|:---:|:---|
| ⚛️ **React 18 + TypeScript** | Interfaz de usuario |
| ⚡ **Vite** | Bundler y servidor de desarrollo |
| 🎨 **Tailwind CSS + shadcn/ui** | Estilos y componentes |
| 🗄️ **Supabase** | Base de datos, auth y tiempo real |
| 🔁 **Supabase Realtime** | Sincronización entre jugadores |

---

## 🚀 Ejecutar en local

> Requisito: tener **Node.js** y **npm** instalados → [instalar con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```bash
# 1️⃣  Clona el repositorio
git clone https://github.com/jairoSanroman/poke-tracker.git

# 2️⃣  Entra en el directorio
cd poke-tracker

# 3️⃣  Instala las dependencias
npm install

# 4️⃣  Crea tu archivo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 5️⃣  Inicia el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173` 🎉

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

> ⚠️ **Nunca subas el archivo `.env` a GitHub.** Ya está incluido en `.gitignore`.

---

## 📁 Estructura del proyecto

```
poke-tracker/
│
├── 📂 src/
│   ├── 📂 components/      # Componentes reutilizables
│   ├── 📂 pages/           # Vistas principales (Dashboard, Rutas, Pokédex...)
│   ├── 📂 hooks/           # Custom hooks (useRealtime, usePokemon...)
│   ├── 📂 lib/             # Config de Supabase y utilidades
│   └── 📂 data/            # Datos estáticos (Pokémon, rutas por generación)
│
├── 📂 supabase/
│   └── 📂 migrations/      # Migraciones de base de datos
│
└── 📂 public/              # Assets estáticos
```

---

## 🤝 ¿Cómo contribuir?

1. Haz un **fork** del repositorio
2. Crea una rama → `git checkout -b feature/mi-mejora`
3. Haz commit → `git commit -m '✨ Añade mi mejora'`
4. Sube la rama → `git push origin feature/mi-mejora`
5. Abre un **Pull Request**

---

<div align="center">

### 🪦 *"No importa cuántos caigan — lo que importa es llegar al Alto Mando."*

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" width="48px"/>
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" width="48px"/>
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png" width="48px"/>
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" width="48px"/>
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png" width="48px"/>
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" width="48px"/>

<br/>

*Hecho con ❤️ para sobrevivir (o no) al Nuzlocke*

</div>
