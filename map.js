var map = null;

function CoordMapType(tileSize) {
  this.tileSize = tileSize;
}

function tileCoordsToBBox(coord, zoom, tileWidth, tileHeight) {
    var proj = map.getProjection();

    // scale is because the number of tiles shown at each zoom level double.
    var scale = Math.pow(2, zoom);

    // A point is created for the north-east and south-west corners, calculated
    // by taking the tile coord and multiplying it by the tile's width and the map's scale.
    var ne = proj.fromPointToLatLng(new google.maps.Point( (coord.x+1) * tileWidth / scale, coord.y * tileHeight / scale));
    var sw = proj.fromPointToLatLng(new google.maps.Point( coord.x * tileWidth / scale, (coord.y+1) * tileHeight / scale));

    return [
        sw.lng(),
        sw.lat(),
        ne.lng(),
        ne.lat()
    ];
}

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('div');
  div.innerHTML = coord;
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = '10';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px';
  div.style.borderColor = '#AAAAAA';
  
  var bbox = tileCoordsToBBox(coord, zoom, 256, 256);
  var sw = {lat: bbox[1], lng: bbox[0]};
  var ne = {lat: bbox[3], lng: bbox[2]};
  var bounds = new google.maps.LatLngBounds(sw, ne);
  
  if(zoom === 17 && coord.x === 93823 && coord.y === 60786) {
    div.style.borderColor = '#AA0000';
    div.style.borderWidth = '10px';    
  }
  
  var contains = bounds.contains(new google.maps.LatLng(12.933453, 77.694696));
  div.innerHTML = coord + "<br />" + bbox.join("<br />") + "<br />" + contains;
  return div;
};

function initMap() {
  if ("geolocation" in navigator) {
    var geo_options = {
      enableHighAccuracy: true, 
      maximumAge: 5000
    };

    var watchID = navigator.geolocation.watchPosition(function(position) {
      if(map == null) {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 17,
          center: {lat: position.coords.latitude, lng: position.coords.longitude}
        });

        // Insert this overlay map type as the first overlay map type at
        // position 0. Note that all overlay map types appear on top of
        // their parent base map.
        map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256)));
      }
    });
  }
  
}