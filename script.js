let map;
let marker;
let tipoMapa = "roadmap";

function initMap() {
    // 1. Leer datos desde el archivo JSON
    fetch("datos.json")
    .then(response => response.json())
    .then(data => {
        // VALIDACIÓN: ¿Son números reales?
        if (isNaN(data.lat) || isNaN(data.lng)) {
            Swal.fire({
                icon: 'error',
                title: 'Error en el JSON',
                text: 'El archivo JSON contiene texto en lugar de coordenadas numéricas.',
                confirmButtonColor: '#d33'
            });
            return; // 
        }

        const ubicacionInicial = { lat: Number(data.lat), lng: Number(data.lng) };


            // Define el estilo antes de crear el mapa
const miEstiloPersonalizado = [
    { "featureType": "administrative", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
    { "featureType": "administrative.province", "elementType": "all", "stylers": [{ "visibility": "off" }] },
    { "featureType": "landscape", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 65 }, { "visibility": "on" }] },
    { "featureType": "poi", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": "50" }, { "visibility": "simplified" }] },
    { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
    { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
    { "featureType": "road.arterial", "elementType": "all", "stylers": [{ "lightness": "30" }] },
    { "featureType": "road.local", "elementType": "all", "stylers": [{ "lightness": "40" }] },
    { "featureType": "transit", "elementType": "all", "stylers": [{ "saturation": -100 }, { "visibility": "simplified" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "hue": "#ffff00" }, { "lightness": -25 }, { "saturation": -97 }] },
    { "featureType": "water", "elementType": "labels", "stylers": [{ "lightness": -25 }, { "saturation": -100 }] }
];
            // 2. Crear el mapa
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: ubicacionInicial,
                mapTypeId: tipoMapa,
                styles: miEstiloPersonalizado, 
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                mapTypeControl: true,
                fullscreenControl: true,
                zoomControl: true
            });
            // 3. Marcador personalizado
            marker = new google.maps.Marker({
                position: ubicacionInicial,
                map: map,
                title: data.nombre,
                animation: google.maps.Animation.DROP,
                icon: {
                    url: "bonbum.png",
                    scaledSize: new google.maps.Size(100, 100)
                }
            });

            // 4. Ventana de información
            const infoWindow = new google.maps.InfoWindow({
                content: `<div style="color:black"><h4>${data.nombre}</h4><p>${data.mensaje}</p></div>`
            });

            marker.addListener("click", () => infoWindow.open(map, marker));

            // 5. Mover marcador con clic en el mapa
            map.addListener("click", (e) => {
                const nuevaPos = e.latLng;
                
                Swal.fire({
                    title: '¿Mover marcador?',
                    text: `Nueva posición: ${nuevaPos.lat().toFixed(4)}, ${nuevaPos.lng().toFixed(4)}`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, mover',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        marker.setPosition(nuevaPos);
                        map.panTo(nuevaPos);
                    }
                });
            });
        })
        .catch(err => console.error("Error cargando JSON:", err));
}

// Click para volver al origen del JSON
function volverAlOrigen() {
    fetch("datos.json")
        .then(response => response.json())
        .then(data => {
            const origen = { lat: data.lat, lng: data.lng };
            
            marker.setPosition(origen);
            map.panTo(origen);
            map.setZoom(13);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
            Toast.fire({
                icon: 'info',
                title: 'Regresando al punto inicial'
            });
        })
        .catch(err => {
            console.error("Error al volver al origen:", err);
            Swal.fire("Error", "No se pudo cargar la ubicación original", "error");
        });
}

// Localización real
function encontrarMiUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const miPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            marker.setPosition(miPos);
            map.setCenter(miPos);
            map.setZoom(16);
            
            Swal.fire('Ubicación encontrada', 'El marcador se movió a tu posición real', 'success');
        }, () => {
            Swal.fire('Error', 'No se pudo acceder a tu ubicación', 'error');
        });
    }
}

// Calcular distancia desde el punto nuevo al punto del JSON
function calcularDistancia() {
    fetch("datos.json").then(res => res.json()).then(data => {
        const puntoOrigen = new google.maps.LatLng(data.lat, data.lng);
        const puntoActual = marker.getPosition();
        
        const distanciaMetros = google.maps.geometry.spherical.computeDistanceBetween(puntoOrigen, puntoActual);
        const distanciaKm = (distanciaMetros / 1000).toFixed(2);

        Swal.fire({
            title: 'Medición de Distancia',
            text: `El marcador está a ${distanciaKm} km del punto inicial del JSON.`,
            icon: 'info'
        });
    });
}

function centrarMapa() {
    if (marker) {
        map.setZoom(15);
        map.panTo(marker.getPosition());
    }
}

function cambiarTipoMapa() {
    tipoMapa = (tipoMapa === "roadmap") ? "hybrid" : "roadmap";
    map.setMapTypeId(tipoMapa);
}

// --- FUNCIONES PARA EL MENÚ RESPONSIVO ---

// Abre y cierra el panel lateral
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

/* Cierra el menú automáticamente al tocar un botón (solo en móviles)
function closeMenuOnMobile() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.remove("active");
    }
}*/

// Agrega esto al final de tu archivo sin borrar nada de lo anterior
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("menu-overlay");
    
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active"); // Muestra/oculta la capa de afuera
}

function closeMenuOnMobile() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("menu-overlay");
        
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }
}

// --- ACTUALIZACIÓN AUTOMÁTICA CADA 2 MINUTOS ---


function actualizacionAutomatica() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const miPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Movemos el marcador y centramos el mapa suavemente
            marker.setPosition(miPos);
            map.panTo(miPos);
            
            console.log("Ubicación actualizada automáticamente");
        }, (error) => {
            console.warn("Error en la actualización automática:", error);
        }, {
            enableHighAccuracy: true
        });
    }
}

setInterval(actualizacionAutomatica, 30000);