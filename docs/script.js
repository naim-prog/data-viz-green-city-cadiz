const mapa = L.map('mapa-cadiz').setView([36.5271, -5.9675], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

let datosPorMunicipio = {};

function obtenerColor(porcentaje) {
    if (porcentaje === null) {return '#000000'};
    return porcentaje > 80 ? '#005a32' : // Verde muy oscuro
           porcentaje > 60 ? '#238b45' : // Verde oscuro
           porcentaje > 40 ? '#41ab5d' : // Verde normal
           porcentaje > 20 ? '#74c476' : // Verde claro
                             '#c7e9c0';  // Verde muy claro (0-20%)
}

Papa.parse("https://raw.githubusercontent.com/naim-prog/data-viz-green-city-cadiz/refs/heads/main/files/datos_municipios.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(resultados) {
        let listaParaOrdenar = [];

        resultados.data.forEach(fila => {
            if (fila.nombre_municipio && fila.porcentaje_vegetacion !== undefined) {
                datosPorMunicipio[fila.nombre_municipio] = fila.porcentaje_vegetacion;
                // Guardamos en un array para poder ordenar
                listaParaOrdenar.push({
                    nombre: fila.nombre_municipio,
                    valor: fila.porcentaje_vegetacion
                });
            }
        });

        listaParaOrdenar.sort((a, b) => b.valor - a.valor);
        generarTablaHTML(listaParaOrdenar);
        cargarGeoJSON();
    }
});

// 5. Función para cargar dibujar los municipios
function cargarGeoJSON() {
    fetch('https://raw.githubusercontent.com/naim-prog/data-viz-green-city-cadiz/refs/heads/main/files/municipios_cadiz.geojson') // Tu archivo con las fronteras
        .then(respuesta => respuesta.json())
        .then(datosGeoJSON => {
            
            capaGeoJSON = L.geoJson(datosGeoJSON, {
                // A) Estilo de cada municipio
                style: function(feature) {
                    const nombreMuni = feature.properties.nombre_municipio; 
                    const porcentaje = datosPorMunicipio[nombreMuni];

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
                    if (porcentaje !== null) {
                        texto += `Vegetación: ${porcentaje.toFixed(2)}%`;
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
                            capaGeoJSON.resetStyle(e.target);
                        }
                    });
                }
            }).addTo(mapa);
            
        })
        .catch(error => console.error("Error cargando el GeoJSON:", error));
}

// Elementos del DOM
const btnTabla = document.getElementById('btn-tabla');
const modalTabla = document.getElementById('modal-tabla');
const btnCerrar = document.getElementById('btn-cerrar');
const cuerpoTabla = document.querySelector('#tabla-vegetacion tbody');

// Función para abrir/cerrar modal
btnTabla.onclick = () => modalTabla.classList.remove('oculto');
btnCerrar.onclick = () => modalTabla.classList.add('oculto');

// Cerramos si el usuario hace clic fuera de la caja blanca
window.onclick = (e) => {
    if (e.target == modalTabla) modalTabla.classList.add('oculto');
};

function generarTablaHTML(datosOrdenados) {
    cuerpoTabla.innerHTML = "";
    
    datosOrdenados.forEach(item => {
        let valor = item.valor;
        if (valor !== null) {
            valor = valor.toFixed(2) + "%";
        } else {
            valor = "Sin datos";
        }
        const fila = `
            <tr>
                <td>${item.nombre}</td>
                <td><b>${valor}</b></td>
            </tr>
        `;
        cuerpoTabla.innerHTML += fila;
    });
}