# Soporte para Modos de Juego en Unity (NEXO)

## Archivos
- `GameModeSupport.cs`: Lógica modular para soportar diferentes modos de juego (deathmatch, team, battle royale, etc.), zonas simétricas/asimétricas y puntos de interés.
- `GameModeTypes.cs`: Enum de tipos de modo de juego.
- `GameModeZoneData.cs`: Estructura de datos para zonas y puntos de interés.

## Características
- Diseño modular adaptable a cualquier modo de juego.
- Zonas simétricas/asimétricas según el modo.
- Puntos de interés múltiples para mantener la acción repartida.
- Fácil integración con el sistema de mapas y entornos NEXO.

## Ejemplo de uso
1. Añade el componente `GameModeSupport` a un GameObject en tu escena.
2. Selecciona el modo de juego en el inspector (`currentMode`).
3. Al iniciar, se crearán las zonas y puntos de interés automáticamente.
4. Personaliza los prefabs, colores o lógica según tus necesidades.

## Extensión
- Puedes conectar este sistema con el loader de mapas (`MapDataLoader.cs`) para adaptar zonas y puntos de interés dinámicamente según el mapa cargado.
- Permite lógica avanzada para spawn, objetivos, reglas de victoria, etc.
