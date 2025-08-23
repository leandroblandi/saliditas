# Electron Structure

This folder contains all the Electron-specific logic for the preaching sheet application.

## Estructura de Carpetas

```
electron/
├── main/                   # Código principal de Electron
│   ├── main.js                    # Archivo principal de la aplicación
│   ├── window-manager.js          # Gestión de ventanas (splash y principal)
│   ├── backend-manager.js         # Gestión del proceso del backend Java
│   ├── python-service-manager.js  # Gestión del proceso del servicio Python
│   └── health-checker.js          # Verificación de salud de todos los servicios
├── config/                 # Configuración de la aplicación
│   ├── app-config.js      # Configuración general de la app
│   └── electron-builder.js # Configuración del builder
├── utils/                  # Utilidades
│   ├── path-utils.js      # Manejo de rutas de archivos
│   └── logger.js          # Sistema de logging
└── splash/                 # Archivos de splash screen
    ├── splash.html
    └── splash.js
```

## Main Modules

### WindowManager
- Manages window creation and destruction
- Handles splash window and main window
- Configures properties for each window

### BackendManager
- Starts and stops the Java backend process
- Monitors process status
- Handles backend startup errors

### ImageGeneratorServiceManager
- Starts and stops the Excel to Image Generator API executable
- Monitors process status
- Handles Image Generator API service startup errors
- Previously known as PythonServiceManager

### HealthChecker
- Verifies that all services are responding
- Implements retries with configurable timeout
- Continuous monitoring of all services health
- Supports both backend and Image Generator API service health checks

### PathUtils
- Centralizes file path handling
- Differentiates between development and production environments
- Consistent paths for all resources

### Logger
- Unified logging system
- Different log levels (info, warn, error, debug)
- Automatic timestamps

## Configuration

### app-config.js
- Centralized application configuration
- Window properties
- Backend configuration
- Image Generator API service configuration
- Development options

### electron-builder.js
- Configuration for packaging
- Platform-specific configuration
- Additional resources included

## Usage

To run the application:

```bash
# Development
npm run electron:dev

# Build and run
npm run electron:build

# Build for distribution
npm run dist
```

## Maintenance

- Each module has specific responsibilities
- Configuration is centralized and easy to modify
- Logging helps with debugging
- The structure is scalable for new features

## Troubleshooting

### Backend Process Issues

If the backend process doesn't close properly when the application exits:

**Windows:**
```bash
# Run the cleanup script
cleanup-backend.bat

# Or manually kill processes
taskkill /F /IM ps-api.exe
```

**Linux/macOS:**
```bash
# Make script executable and run
chmod +x cleanup-backend.sh
./cleanup-backend.sh

# Or manually kill processes
pkill -f ps-api
```

### Image Generator API Service Process Issues

If the Image Generator API service process doesn't close properly when the application exits:

**Windows:**
```bash
# Run the cleanup script
cleanup-python-service.bat

# Or manually kill processes
taskkill /F /IM excel-image-generator-api.exe
```

**Linux/macOS:**
```bash
# Make script executable and run
chmod +x cleanup-python-service.sh
./cleanup-python-service.sh

# Or manually kill processes
pkill -f excel-image-generator-api
```

### Process Cleanup

The application now includes robust process cleanup for both services:
- Graceful shutdown with SIGTERM
- Force kill with SIGKILL after timeout
- Windows-specific taskkill for stubborn processes
- Emergency cleanup scripts for orphaned processes
- Automatic cleanup of both Java backend and Python service processes
