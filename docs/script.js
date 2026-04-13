document.addEventListener('DOMContentLoaded', function() {
        
    const mapa = L.map('mapa-cadiz').setView([36.5271, -5.9675], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    let datosPorMunicipio = {};
    let capaGeoJSON;

    const sidebar = document.getElementById('sidebar');
    const btnToggle = document.getElementById('btn-toggle');
    let panelAbierto = false;

    const svgMenu = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />`;
    const svgCruz = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;

    btnToggle.addEventListener('click', () => {
        panelAbierto = !panelAbierto;
        const icono = btnToggle.querySelector('svg');
        
        if (panelAbierto) {
            // Abrimos: damos ancho y añadimos el borde
            sidebar.classList.remove('w-0');
            sidebar.classList.add('w-80', 'md:w-96', 'border-r', 'border-slate-200');
            icono.innerHTML = svgCruz; 
        } else {
            // Cerramos: quitamos ancho y el borde por completo
            sidebar.classList.remove('w-80', 'md:w-96', 'border-r', 'border-slate-200');
            sidebar.classList.add('w-0');
            icono.innerHTML = svgMenu;
        }

        // Recalcular tamaño del mapa tras la animación
        setTimeout(() => {
            mapa.invalidateSize();
        }, 300);
    });

    function obtenerColor(porcentaje) {
        if (porcentaje === null) {return '#000000'};
        return porcentaje > 80 ? '#005a32' :
            porcentaje > 60 ? '#238b45' :
            porcentaje > 40 ? '#41ab5d' :
            porcentaje > 20 ? '#74c476' :
                                '#c7e9c0';
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
                            fillOpacity: 0.8 // Transparencia del color de fondo
                        };
                    },

                    onEachFeature: function(feature, layer) {
                        const nombreMuni = feature.properties.nombre_municipio;
                        const porcentaje = datosPorMunicipio[nombreMuni];

                        let texto = `
                            <div class="text-center">
                                <strong class="block text-emerald-800 mb-1">${nombreMuni}</strong>
                                <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs border border-slate-200">
                                    ${porcentaje !== null ? porcentaje.toFixed(2) + '% de Vegetación' : 'Sin datos'}
                                </span>
                            </div>
                        `;

                        layer.bindTooltip(texto, { sticky: true });

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
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="font-medium text-slate-700">${item.nombre}</td>
                    <td class="text-right">
                        <span class="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                            ${valor}
                        </span>
                    </td>
                </tr>
            `;
            cuerpoTabla.innerHTML += fila;
        });
    }
});