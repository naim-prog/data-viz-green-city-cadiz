# Introduccion

<h3> ¿Cuanta vegetación se encuentra dentro de cada municipio de Cádiz? </h3>

Este proyecto intenta mediante el estudio de las imágenes satelitales dar luz a la pregunta: ¿Cual es el municipio de Cádiz más verde?

Algunos municipios cuentan con un límite administrativo bastante grande en comparación con el núcleo urbano que tiene, pero esto no exime de la posibilidad de alojar zonas verdes como parques o plazas en municipios con un área administrativa más pequeña que otros.

# Metodología

Las imágenes satelitales (con resolución 0.25m. x 0.25m. por píxel) han sido binarizadas siguiendo 3 condiciones para contabilizar un píxel de la imagen como '**Vegetacion**':

* El coeficiente **NDVI** (_Normalized Difference Vegetation Index_) debe superar un umbral de **0.35**

* El brillo de las bandas **NIR** y **Roja** deben superar un umbral de **40**

* La intensidad de la banda **NIR** debe superar un valor de **100**

En caso de que un píxel superase todas estas condiciones sería considerado como '**Vegetacion**'

# Resultados

Pueden verse los resultados de este proyecto en la web [naim-prog.github.io/green-city-cadiz](https://naim-prog.github.io/green-city-cadiz)

# Fuentes

* Imágenes satelitales propiedad del [CNIG](https://centrodedescargas.cnig.es/CentroDescargas/ortofoto-pnoa-falso-color-infrarrojo) (_Centro Nacional de Información Geográfica_)
* Datos geoespaciales propiedad de [OpenStreetMap](https://www.openstreetmap.org/) y procesados por [Geofabrik Gmbh](https://www.geofabrik.de)