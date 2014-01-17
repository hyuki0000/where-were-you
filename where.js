var Where = {

  // Options.

  LATITUDE_RANGE: 0.001,
  LONGITUDE_RANGE: 0.001,

  // Utils

  debug: function (s) {
    var msg = "debug: " + s + "\n";
    var current = document.getElementById("debug").innerHTML;
    document.getElementById("debug").innerHTML = msg + current;
  },

  error: function (s) {
    var msg = "ERROR: " + s + "\n";
    var current = document.getElementById("debug").innerHTML;
    document.getElementById("debug").innerHTML = msg + current;
    alert(msg);
  },

  // Events
 
  onLoad: function() {
    "use strict";
    Where.debug('application started.');
    Where.initMap();
    Where.initRecords();
    Where.initPlaces();
    if (navigator.geolocation) {
      Where.debug('Geo Location API is supported.');
      // navigator.geolocation.getCurrentPosition(success, error);
      Where.watchid = navigator.geolocation.watchPosition(
          Where.watchPosition,
          Where.watchError,
          Where.watchOption
      );
      Where.debug('watchPosition returns ' + Where.watchid);
    } else {
      Where.error('Geo Location API is not supported.');
    }
    document.getElementById("register").onclick = Where.onRegister;
    document.getElementById("clearDebug").onclick = function (e) {
      document.getElementById("debug").innerHTML = '';
    };
    document.getElementById("deletePlaces").onclick = function (e) {
      Where.places = [];
      localStorage.setItem('places', JSON.stringify(Where.places));
      Where.updateDisplay();
    };
    document.getElementById("deleteRecords").onclick = function (e) {
      Where.records = [];
      localStorage.setItem('records', JSON.stringify(Where.records));
      Where.updateDisplay();
    };
  },

  onRegister: function (e) {
    if (Where.records === null) {
      Where.error("onRegister: No records.");
    } else if (Where.records.length == 0) {
      Where.error("onRegister: No records.");
    } else {
      var place = document.getElementById("place").value;
      var lat = Where.records[0].latitude;
      var lng = Where.records[0].longitude;
      Where.appendPlace({
        place: place,
        latitude: lat,
        longitude: lng,
      });
    }
    Where.updateDisplay();
  },
 
  // View

  updateDisplay: function () {
    document.getElementById("records").innerHTML = Where.records.map(function(obj) {
      return "<li>" + JSON.stringify(obj) + "</li>";
    }).join('');
    document.getElementById("places").innerHTML = Where.places.map(function(obj) {
      return "<li>" + JSON.stringify(obj) + "</li>";
    }).join('');
  },

  initMap: function () {
    document.getElementById("map").style.height = 100;
    document.getElementById("map").style.width = 100;
  },

  // Model

  records: [],
  places: [],

  initPlaces: function () {
    Where.places = JSON.parse(localStorage.getItem('places'));
    if (Where.places === null) {
      Where.places = [];
    }
    Where.updateDisplay();
  },

  initRecords: function () {
    Where.records = JSON.parse(localStorage.getItem('records'));
    if (Where.records === null) {
      Where.records = [];
    }
    Where.updateDisplay();
  },

  appendRecord: function (obj) {
    Where.records.unshift(obj);
    // Where.debug("appendRecord: " + JSON.stringify(obj));
    localStorage.setItem('records', JSON.stringify(Where.records));
    Where.updateDisplay();
  },

  appendPlace: function (obj) {
    Where.places.unshift(obj);
    Where.debug("appendPlace: " + JSON.stringify(obj));
    localStorage.setItem('places', JSON.stringify(Where.places));
    Where.updateDisplay();
  },

  guessPlace: function (lat, lng) {
    if (Where.places === null || Where.places.length === 0) {
      return "Unknown";
    }
    for (var i = 0; i < Where.places.length; i++) {
      var clat = Where.places[i].latitude;
      var clng = Where.places[i].longitude;
      if (clat - Where.LATITUDE_RANGE < lat && lat < clat + Where.LATITUDE_RANGE
       && clng - Where.LONGITUDE_RANGE < lng && lng < clng + Where.LONGITUDE_RANGE) {
        return Where.places[i].place;
      }
    }
    return "Unknown";
  },

  // Geolocation
 
  watchid: -1,

  watchPosition: function (pos) {
    var now = new Date();
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    var place = Where.guessPlace(lat, lng);
    Where.debug('(latitude, longitude) = (' + lat + ', ' + lng + ')');
    Where.showMap(lat, lng);
    Where.appendRecord({
      place: place,
      time: now.getTime(),
      latitude: lat,
      longitude: lng,
      timeISOString: now.toISOString()
    });
  },

  watchError: function (error) {
    // Where.debug('watchError: ' + error.code + ': ' + error.message);
    switch (error.code) {
    case 1:
      alert('watchPosition: PERMISSION_DENIED');
      break;
    case 2:
      alert('watchPosition: POSITION_UNAVAILABLE');
      break;
    case 3:
      // alert('watchPosition: TIMEOUT');
      break;
    default:
      alert('watchPosition: UNKNOWN_ERROR');
    }
  },

  watchOption: {
    enableHighAccuracy: true,
    timeout: 60000,
    maximumAge: 60000
  },

  // Map

  map: null,

  marker: null,

  showMap: function (lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    Where.map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 15,
        center: latlng,
        mapTypeControl: false,
        streetViewControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    Where.marker = new google.maps.Marker({
      clickable: false,
      draggable: false,
      flat: false,
      map: Where.map,
      position: latlng,
      visible: true
    });
  },
  terminator: null
};

window.onload = Where.onLoad;
