# Empty State Component

Componente reutilizable para mostrar estados vacíos en la aplicación cuando no hay datos para mostrar.

## Uso

```html
<app-empty-state 
  icon="people"
  title="No hay conductores registrados"
  description="Aún no se han registrado conductores en el sistema."
  [showAction]="true">
  
  <div empty-state-action>
    <button mat-raised-button color="primary">
      <mat-icon>add</mat-icon>
      Agregar conductor
    </button>
  </div>
</app-empty-state>
```

## Propiedades

- `icon`: Icono de Material Design a mostrar (por defecto: 'inbox')
- `title`: Título principal del mensaje (por defecto: 'No hay datos disponibles')
- `description`: Descripción detallada del estado (por defecto: 'No se encontraron registros para mostrar en este momento.')
- `showAction`: Booleano para mostrar/ocultar la sección de acciones (por defecto: false)

## Acciones

Para mostrar botones de acción, usa el selector `[empty-state-action]`:

```html
<div empty-state-action>
  <button mat-raised-button color="primary">Acción principal</button>
  <button mat-stroked-button>Acción secundaria</button>
</div>
```

## Estilos personalizados

El componente puede ser estilizado usando CSS personalizado:

```scss
:host ::ng-deep app-empty-state {
  .empty-state-container {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
  }
  
  .empty-state-icon mat-icon {
    color: #1976d2;
  }
}
```

## Iconos recomendados

- `people` - Para listas de personas/usuarios
- `history` - Para historiales/registros
- `event` - Para eventos/calendarios
- `inbox` - Para mensajes/notificaciones
- `folder` - Para archivos/documentos
- `search` - Para resultados de búsqueda
- `schedule` - Para programaciones/horarios
