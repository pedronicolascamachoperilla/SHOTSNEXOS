// Multilenguaje para nombres y descripciones de mapas NEXO
// - Traducción de nombres y descripciones
// - Detección automática de idioma
// - Selector de idioma en el menú de mapas
// - Integración con el editor y la comunidad

// Este archivo es un stub para la lógica de multilenguaje en nombres y descripciones de mapas.
// Puedes expandirlo para soportar traducciones y selección de idioma.

// Ejemplo de estructura:
// {
//   "name": { "es": "Ciudad Ruinas", "en": "Ruins City" },
//   "description": { "es": "Zona urbana devastada...", "en": "Devastated urban area..." }
// }

// Si deseas la integración automática de la lógica, solicita la función específica.

class MapI18n {
  constructor(mapData) {
    this.mapData = mapData;
  }
  getName(lang) {
    if(typeof this.mapData.name==='object') return this.mapData.name[lang]||this.mapData.name['es'];
    return this.mapData.name;
  }
  getDescription(lang) {
    if(typeof this.mapData.description==='object') return this.mapData.description[lang]||this.mapData.description['es'];
    return this.mapData.description;
  }
}
window.MapI18n = MapI18n;
