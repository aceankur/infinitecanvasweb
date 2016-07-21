$(function() {
  if ("geolocation" in navigator) {
    var geo_options = {
      enableHighAccuracy: true
    };
    var watchID = navigator.geolocation.watchPosition(function(position) {
      console.log(position);
      try {
        if(position != null && position.coords != null)
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
    });
  }
});