# BioCat - Sistema de Gestión de Inventario

🐱 Sistema moderno de gestión de inventario, clientes y órdenes de compra para BioCat, empresa especializada en arena para gato biodegradable de tofu.

## 🌟 Características

- ✅ **Autenticación segura** con almacenamiento local
- 🌓 **Modo oscuro** con detección automática del sistema
- 📱 **Diseño responsive** para móviles, tablets y escritorio
- 🔔 **Notificaciones personalizadas** (no nativas del navegador)
- 💾 **Persistencia de datos** con localStorage
- 🎨 **Tema ecológico** inspirado en productos biodegradables
- ⚡ **Rendimiento optimizado** con Vite y React 18

## 📋 Módulos

### Dashboard Principal
- **Inventario** - Gestión de productos de arena para gato
- **Clientes** - Administración de información de clientes
- **Órdenes** - Creación y seguimiento de órdenes de compra
- **Estadísticas** - Métricas y reportes de ventas
- **Configuraciones** - Ajustes del sistema

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Routing**: React Router v6
- **Almacenamiento**: LocalStorage API
- **Deployment**: GitHub Pages + GitHub Actions

## 💻 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🔐 Credenciales de Acceso

- **Usuario**: Anahi
- **Contraseña**: 2025

## 📁 Estructura del Proyecto

```
biocat/
├── src/
│   ├── components/
│   │   ├── auth/          # Componentes de autenticación
│   │   └── common/        # Componentes reutilizables
│   ├── context/           # Contextos de React
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Páginas de la aplicación
│   ├── types/             # Definiciones TypeScript
│   └── utils/             # Funciones de utilidad
├── .github/
│   └── workflows/         # GitHub Actions
└── public/                # Archivos estáticos
```

## 🎨 Paleta de Colores

- **Primary**: Tonos verdes (#22c55e) - Representa lo natural y ecológico
- **Secondary**: Tonos amarillos (#eab308) - Energía y positividad
- **Neutral**: Tonos grises - Balance y profesionalismo

## 🌐 Despliegue

La aplicación se despliega automáticamente a GitHub Pages cuando se hace push a la rama `main`:

1. Crea un repositorio en GitHub
2. Habilita GitHub Pages en la configuración del repositorio
3. Push tu código a la rama main
4. GitHub Actions construirá y desplegará automáticamente

## 📝 Próximas Funcionalidades

- Implementación completa de módulo de Inventario
- Implementación completa de módulo de Clientes
- Implementación completa de módulo de Órdenes
- Gráficos y visualización de estadísticas
- Exportación de reportes (PDF, Excel)
- Sistema de búsqueda avanzada
- Filtros y ordenamiento

## 🤝 Contribución

Este es un proyecto privado para BioCat. Para cualquier sugerencia o mejora, contacta al equipo de desarrollo.

## 📄 Licencia

Todos los derechos reservados © 2025 BioCat
