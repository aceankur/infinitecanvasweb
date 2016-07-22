var map = null;
var api = "http://172.20.168.194:9320";
var ssl_api = "https://172.20.168.194:9321";

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

function getGradientColor(start_color, end_color, percent) {
   // strip the leading # if it's there
   start_color = start_color.replace(/^\s*#|\s*$/g, '');
   end_color = end_color.replace(/^\s*#|\s*$/g, '');

   // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
   if(start_color.length == 3){
     start_color = start_color.replace(/(.)/g, '$1$1');
   }

   if(end_color.length == 3){
     end_color = end_color.replace(/(.)/g, '$1$1');
   }

   // get colors
   var start_red = parseInt(start_color.substr(0, 2), 16),
       start_green = parseInt(start_color.substr(2, 2), 16),
       start_blue = parseInt(start_color.substr(4, 2), 16);

   var end_red = parseInt(end_color.substr(0, 2), 16),
       end_green = parseInt(end_color.substr(2, 2), 16),
       end_blue = parseInt(end_color.substr(4, 2), 16);

   // calculate new color
   var diff_red = end_red - start_red;
   var diff_green = end_green - start_green;
   var diff_blue = end_blue - start_blue;

   diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
   diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
   diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

   // ensure 2 digits by color
   if( diff_red.length == 1 )
     diff_red = '0' + diff_red

   if( diff_green.length == 1 )
     diff_green = '0' + diff_green

   if( diff_blue.length == 1 )
     diff_blue = '0' + diff_blue

   return '#' + diff_red + diff_green + diff_blue;
 };

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('div');
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  
  var bbox = tileCoordsToBBox(coord, zoom, 256, 256);
  var sw = {lat: bbox[1], lng: bbox[0]};
  var ne = {lat: bbox[3], lng: bbox[2]};

  var carrier = $("#carrier").val();
  var network = $("#network").val();
  var ssl = $("#ssl").val();
  var endpoint = api;

  if(network == "any") { network = null; }
  if(ssl) { endpoint = ssl_api; }

  $.get(endpoint + "/signal/network", {
    "sw_lat": sw.lat,
    "sw_lng": sw.lng,
    "ne_lat": ne.lat,
    "ne_lng": ne.lng,
    "carrier": carrier,
    "network": network
  }, function(data) {
    var strength = parseFloat(data);
    if(strength) {
      div.style.opacity = 0.5;
      if (strength > 1 && strength <= 2) {
        div.style.backgroundColor = getGradientColor("#FF0000", "#FFA500", strength - 1);
      } else if (strength > 2 && strength <= 3) {
        div.style.backgroundColor = getGradientColor("#FFA500", "#FFFF00", strength - 2);
      } else if (strength > 3 && strength <= 4) {
        div.style.backgroundColor = getGradientColor("#FFFF00", "#00FF00", strength - 3);
      }
    }
  });

  // var bounds = new google.maps.LatLngBounds(sw, ne);
  // var contains = bounds.contains(new google.maps.LatLng(12.933453, 77.694696));
  // div.innerHTML = coord + "<br />" + bbox.join("<br />") + "<br />" + contains;
  // if(zoom === 17 && coord.x === 93823 && coord.y === 60786) {
  //   div.style.borderColor = '#AA0000';
  //   div.style.borderWidth = '1px';
  //   console.log(bbox);   
  // }
  return div;
};

function initMap() {
  if ("geolocation" in navigator) {
    var geo_options = {
      enableHighAccuracy: true
    };

    var watchID = navigator.geolocation.watchPosition(function(position) {
      console.log(position);
      try {
        if(position != null && position.coords != null) {
          try {
            Android.sendLocation(JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            }));
          } catch(e) {
            console.error(e);
          }

          if(map == null) {
            map = new google.maps.Map(document.getElementById('map'), {
              zoom: 17,
              center: {lat: position.coords.latitude, lng: position.coords.longitude},
              minZoom: 12,
              maxZoom: 19
            });

            map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256)));
            $("#carrier").change(function() {
              map.overlayMapTypes.removeAt(0); 
              map.overlayMapTypes.setAt(0, new CoordMapType(new google.maps.Size(256, 256))); 
            });
            $("#network").change(function() {
              map.overlayMapTypes.removeAt(0); 
              map.overlayMapTypes.setAt(0, new CoordMapType(new google.maps.Size(256, 256))); 
            });
            $("#ssl").change(function() {
              map.overlayMapTypes.removeAt(0); 
              map.overlayMapTypes.setAt(0, new CoordMapType(new google.maps.Size(256, 256)));
            });
          }
        }
      } catch(e) {
        console.error(e);
      }
    });

  }
  
}