// JavaScript Document
// map.js
(function(root) {
    'use strict';

    var appMap = {};

    var startPoint = {
        lat: -22.983611,
        lng: -43.204444
    };

    var onLoad = function() {};
    var onError = function() {};

    appMap.onLoad = function( success, error ) {
        onLoad = success;
        onError = error;

        return appMap;
    };

    appMap.load = function(ev) {
        // we pass the event ev, so we can check if the event is an ErrorEvent
        // we check if the map was succesfully loaded (just check the appMap.map)
        if (appMap.map) {
            onLoad.call(appMap);
        } else {
            onError.call(appMap, ev);
        }
    };

    /*
        Utility For Initializing The Google Map
        Needs To Be Global
    */
    appMap.init = function initMap(callfail) {
        var mapDiv = document.getElementById('map');

        /*
            Instantiate a new map object
        */
        appMap.map = new google.maps.Map(mapDiv, {
            center: startPoint,
            zoom: 15
        });
        // Set up map options		
        var customMapType = new google.maps.StyledMapType([{
            stylers: [{
                hue: '#'
            }, {
                visibility: 'simplified'
            }, {
                gamma: 0.5
            }, {
                weight: 0.5
            }]
        }, {
            elementType: 'labels',
            // Turn visibility 'On' to indicates roads on the map	
            stylers: [{
                visibility: 'on'
            }]
        }, {
            featureType: 'water',
            stylers: [{
                color: 'blue'
            }]
        }], {
            name: 'Custom Style'
        });

        var customMapTypeId = 'custom_style';

        appMap.map.mapTypes.set(customMapTypeId, customMapType);
        appMap.map.setMapTypeId(customMapTypeId);

        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, customMapTypeId]
        };

        return appMap.map;
    }

    appMap.getPlaces = function(callback) {
        /*
            Create New InfoWindow
        */
        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(appMap.map);

        return service.nearbySearch({
            location: startPoint,
            // set search radius to 1000 meters and type = Bar
            radius: 1000,
            type: ['bar']
        }, callback);
    };

    /*
        Will Contain The List Of All Markers for
        the Locations on the Map
    */
    appMap.markers = [];
    appMap.markerList = function(place) {
        var marker = new google.maps.Marker({
            position: place.position,
            map: appMap.map,
            animation: google.maps.Animation.DROP,
            title: place.name,
            data: place
        });
        root.appMap.markers.push(marker);

        return marker;
    };

    root.appMap = appMap;

})(this);