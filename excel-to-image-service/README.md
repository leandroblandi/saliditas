# Excel to Image Service

Servicio Python que convierte rangos específicos de archivos Excel a imágenes PNG.

## Instalación

1. **Requisitos:**
   - Python 3.7+
   - pip

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

## Uso

### Iniciar el servicio:

**Windows:**
```bash
start.bat
```

**Unix/Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual:**
```bash
python app.py
```

El servicio se ejecutará en `http://localhost:5001`

## API Endpoints

### POST `/excel-to-image`

Convierte un rango de Excel a imagen PNG.

**Parámetros:**
- `file`: Archivo Excel (.xlsx o .xls)
- `range`: Rango a convertir (ej: "B2:G16")
- `sheet`: Nombre de la hoja (opcional)

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:5001/excel-to-image \
  -F "file=@planilla.xlsx" \
  -F "range=B2:G16" \
  -F "sheet=Semana del 19 al 24 de Agosto"
```

### GET `/health`

Verificación de estado del servicio.

## Configuración

- **Puerto:** 5001 (configurable en `app.py`)
- **Host:** 0.0.0.0 (acepta conexiones externas)
- **CORS:** Habilitado para frontend
