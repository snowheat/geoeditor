/**
 * featureCoordinates menyimpan array koordinat dari fitur-fitur yang digambar
 * variabel ini yang nanti diambil untuk aplikasi
 */
var featureCoordinates = [];

// center menyimpan titik tengah awal peta (Jawa Barat)
var center = [107.6689, -6.9909];

// raster menyimpan object Tile Layer untuk peta Open Street Map
var raster = new ol.layer.Tile({source: new ol.source.OSM()});

// source menyimpan object Vector Source untuk menggambar pada peta
var source = new ol.source.Vector({wrapX: false});

// style menyimpan konfigurasi warna dan ketebalan dari fitur gambar
var style = new ol.style.Style({
  fill: new ol.style.Fill({color: 'rgba(1, 101, 47, 0.3)'}),
  stroke: new ol.style.Stroke({color: '#01652f', width: 2}),
  image: new ol.style.Circle({radius: 7, fill: new ol.style.Fill({color: '#01652f'})})
});
// vector menyimpan object Vector Layer dengan konfigurasi style
var vector = new ol.layer.Vector({source: source, style: style,});

// view menyimpan object View yang menentukan konfigurasi pandangan pada peta
var view = new ol.View({projection: 'EPSG:4326', center: center, zoom: 8});

/**
 * map menyimpan object utama dari peta
 */
var map = new ol.Map({layers: [raster, vector],target: 'map', view: view });

function httpGetAsync(theUrl, callback)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

$(function() {

  // draw menyimpan object interaksi Draw yang digunakan untuk menggambar pada Vector Source
  var draw;

  var handleDrawstart = function(e) {}

  var handleDrawend = function(e) {
    const coordinates = e.feature.getGeometry().getCoordinates();
    featureCoordinates.push(coordinates);
    console.log("Array koordinat fitur untuk diambil:", featureCoordinates);
  }

  function addInteraction() {

    var value = $("#type").val();

    if (value !== '-') {

      draw = new ol.interaction.Draw({
        source: source,
        type: $("#type").val(),
      });

      draw.on("drawstart", handleDrawstart);
      draw.on("drawend", handleDrawend);

      map.addInteraction(draw);
    }
  }

  var clearDraw = function(e) {
    e.preventDefault();
    featureCoordinates = [];
    source.clear();
  }

  $("#clear-button").click(clearDraw);

  $("#search-button").click(function(e) {
    e.preventDefault();
    var keyword = $("#search-input").val().toLowerCase().includes("jawa barat") ? $("#search-input").val().toLowerCase() : $("#search-input").val().toLowerCase() + " jawa barat";

    $.get(`https://nominatim.openstreetmap.org/search?q=${keyword}&format=json`, function( data ) {
      if (data.length > 0) {
        var extent = [parseFloat(data[0].boundingbox[2]), parseFloat(data[0].boundingbox[0]), parseFloat(data[0].boundingbox[3]), parseFloat(data[0].boundingbox[1])];
        var center = [data[0].lon, data[0].lat];

        map.getView().fit(extent, {duration: 200});
      }
    });
  })

  /**
   * Handle change event.
   */
  $("#type").change(function() {
    map.removeInteraction(draw);
    addInteraction();
  });

  addInteraction();
});


