import Map from 'https://cdn.skypack.dev/ol/Map.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import { Point } from 'https://cdn.skypack.dev/ol/geom.js';
import { Feature } from 'https://cdn.skypack.dev/ol/index.js';
import { Icon, Style } from 'https://cdn.skypack.dev/ol/style.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import { fromLonLat, toLonLat } from 'https://cdn.skypack.dev/ol/proj.js';

// Membuat peta
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([106.8456, -6.2088]), // Pusat peta di Indonesia (Jakarta)
    zoom: 5
  })
});

// Membuat sumber vektor untuk menyimpan marker
const vectorSource = new VectorSource();

// Membuat lapisan vektor untuk menampilkan marker
const vectorLayer = new VectorLayer({
  source: vectorSource
});

// Menambahkan lapisan vektor ke peta
map.addLayer(vectorLayer);

// Array untuk menyimpan marker
let markers = [];

// Fungsi untuk menambahkan marker
function addMarker(coordinate) {
  const marker = new Feature({
    geometry: new Point(coordinate)
  });

  const markerStyle = new Style({
    image: new Icon({
      src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png',
      scale: 0.4
    })
  });

  marker.setStyle(markerStyle);
  vectorSource.addFeature(marker);
  markers.push(marker);
}

// Fungsi untuk mendapatkan nama lokasi menggunakan API Geocoding (Nominatim)
async function getLocationInfo(coordinate) {
  const lonLat = toLonLat(coordinate); // Convert from EPSG:3857 to EPSG:4326
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lonLat[1]}&lon=${lonLat[0]}&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

// Menambahkan event listener untuk klik pada peta
map.on('click', async function (event) {
  const coordinate = event.coordinate; // Koordinat dalam EPSG:3857

  // Menambahkan marker pada lokasi yang diklik
  addMarker(coordinate);

  // Menampilkan informasi koordinat di elemen #info
  const infoDiv = document.getElementById('info');
  const lonLat = toLonLat(coordinate); // Konversi koordinat dari EPSG:3857 ke EPSG:4326
  const infoContent = `You clicked at:<br>Latitude: ${lonLat[1].toFixed(4)}<br>Longitude: ${lonLat[0].toFixed(4)}`;

  // Dapatkan informasi lokasi (nama daerah)
  const location = await getLocationInfo(coordinate);
  const locationInfo = location ? location.display_name : 'Location not found';

  // Menampilkan informasi tanpa menghapus yang sudah ada
  infoDiv.innerHTML += `<br><strong>Location:</strong> ${locationInfo}`;
  infoDiv.innerHTML += `<br><strong>Coordinates:</strong> Latitude: ${lonLat[1].toFixed(4)} Longitude: ${lonLat[0].toFixed(4)}`;

  // Jika ada dua marker, tampilkan informasi jarak
  if (markers.length === 2) {
    const marker1 = markers[0];
    const marker2 = markers[1];

    const distance = calculateDistance(marker1, marker2);
    alert(`Distance between marker 1 and marker 2: ${distance}`);

    // Menambahkan informasi nama lokasi untuk kedua marker
    const location1 = await getLocationInfo(marker1.getGeometry().getCoordinates());
    const location2 = await getLocationInfo(marker2.getGeometry().getCoordinates());

    // infoDiv.innerHTML += `<br><strong>Marker 1 Location:</strong> ${location1.display_name}`;
    // infoDiv.innerHTML += `<br><strong>Marker 2 Location:</strong> ${location2.display_name}`;
  }
});

// Fungsi untuk menghitung jarak antara dua marker
function calculateDistance(marker1, marker2) {
  const coord1 = marker1.getGeometry().getCoordinates();
  const coord2 = marker2.getGeometry().getCoordinates();

  const lonLat1 = toLonLat(coord1);
  const lonLat2 = toLonLat(coord2);

  const x1 = lonLat1[0];
  const y1 = lonLat1[1];
  const x2 = lonLat2[0];
  const y2 = lonLat2[1];

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (y2 - y1) * Math.PI / 180;
  const dLon = (x2 - x1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(y1 * Math.PI / 180) * Math.cos(y2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance.toFixed(2) + " km";
}
