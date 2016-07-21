$(function() {
  if ("geolocation" in navigator) {
    var geo_options = {
      enableHighAccuracy: true, 
      maximumAge: 5000
    };
    var watchID = navigator.geolocation.watchPosition(function(position) {
      console.log(position);
      Android.sendLocation(position.coords);
    });
  }
});