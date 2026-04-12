// 1. Inicializamos el mapa centrado en la provincia de Cádiz
const mapa = L.map('mapa-cadiz').setView([36.5271, -5.9675], 9);

// 2. Añadimos la capa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

// Variable para guardar los datos del CSV
let datosPorMunicipio = {};

// 3. Función para asignar un color dependiendo del porcentaje
// Puedes cambiar estos colores HEX por los que más te gusten
function obtenerColor(porcentaje) {
    return porcentaje > 80 ? '#005a32' : // Verde muy oscuro
           porcentaje > 60 ? '#238b45' : // Verde oscuro
           porcentaje > 40 ? '#41ab5d' : // Verde normal
           porcentaje > 20 ? '#74c476' : // Verde claro
                             '#c7e9c0';  // Verde muy claro (0-20%)
}

// 4. Leemos el CSV desde GitHub Pages
Papa.parse("https://github.com/naim-prog/data-viz-green-city-cadiz/blob/main/files/datos_municipios.csv", {
    download: true,       // Le dice a PapaParse que es un archivo externo
    header: true,         // Usa la primera fila como nombres de variables
    dynamicTyping: true,  // Convierte los números de texto a formato numérico
    complete: function(resultados) {
        
        // Guardamos los datos en un diccionario: {"Jerez": 45.2, "Tarifa": 60.1}
        resultados.data.forEach(fila => {
            if (fila.nombre_municipio && fila.porcentaje_vegetacion !== undefined) {
                datosPorMunicipio[fila.nombre_municipio] = fila.porcentaje_vegetacion;
            }
        });

        // Una vez tenemos el CSV, cargamos los polígonos
        cargarGeoJSON();
    }
});

// 5. Función para cargar dibujar los municipios
function cargarGeoJSON() {
    fetch('https://github.com/naim-prog/data-viz-green-city-cadiz/blob/main/files/municipios_cadiz.geojson') // Tu archivo con las fronteras
        .then(respuesta => respuesta.json())
        .then(datosGeoJSON => {
            
            L.geoJson(datosGeoJSON, {
                // A) Estilo de cada municipio
                style: function(feature) {
                    // OJO: "feature.properties.name" depende de cómo esté estructurado tu GeoJSON.
                    // A veces se llama "NAMEUNIT", "Municipio", etc. Ábrelo con un bloc de notas para comprobarlo.
                    const nombreMuni = feature.properties.nombre_municipio; 
                    const porcentaje = datosPorMunicipio[nombreMuni] || 0; // Si no hay datos, ponemos 0

                    return {
                        fillColor: obtenerColor(porcentaje),
                        weight: 1,       // Grosor del borde
                        opacity: 1,      // Opacidad del borde
                        color: 'white',  // Color del borde
                        dashArray: '3',  // Borde punteado
                        fillOpacity: 0.7 // Transparencia del color de fondo
                    };
                },
                // B) Interacción (Tooltip al pasar el ratón)
                onEachFeature: function(feature, layer) {
                    const nombreMuni = feature.properties.nombre_municipio;
                    const porcentaje = datosPorMunicipio[nombreMuni];

                    // Preparamos el texto a mostrar
                    let texto = `<b>${nombreMuni}</b><br/>`;
                    if (porcentaje !== undefined) {
                        texto += `Vegetación: ${porcentaje}%`;
                    } else {
                        texto += `<i>Sin datos</i>`;
                    }

                    // Añadimos el tooltip que persigue al ratón (sticky: true)
                    layer.bindTooltip(texto, { sticky: true });

                    // Opcional: Resaltar el borde al pasar el ratón
                    layer.on({
                        mouseover: function(e) {
                            var capa = e.target;
                            capa.setStyle({
                                weight: 3,
                                color: '#666',
                                dashArray: '',
                                fillOpacity: 0.9
                            });
                            capa.bringToFront();
                        },
                        mouseout: function(e) {
                            // Devuelve el estilo al estado original
                            this.resetStyle(e.target);
                        }
                    });
                }
            }).addTo(mapa);
            
        })
        .catch(error => console.error("Error cargando el GeoJSON:", error));
}