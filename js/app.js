// JavaScript Document
// app.js
/*
    Run Anonymous Function To Prevent Anything From
    Spreading To The Global Scope.
*/
(function(root) {
    'use scrict';

    // Object for Storing Error Message		
    var Notice = {
        notice: function(msg, type) {
            $('.notify').removeClass('ok').removeClass('error');

            $('.notify').addClass(type);
            $('.notify-text').text(msg);

            $('.notify').fadeIn(300);

            setTimeout(function() {
                $('.notify').fadeOut(300);
            }, 5000);
        },
        ok: function(msg) {
            Notice.notice(msg, 'ok');
        },
        error: function(msg) {
            Notice.notice(msg, 'error');
        }
    };
    // error catching
    try {
        google.maps;
        ko.observable();

        app();
    } catch (e) {
        Notice.error("There was problem loading the Google Map, please check your internet.");
        // fade out side bar and search bar if error
        $('.sidebar, .searchbar').fadeOut(200);
    }

    function app() {

        /*
        Variable to hold Images for the UI Place List which Contains the
        list of all the Places that are relevant to the
        current search.
  
        Base Url For The InstaGram API Request
        Search By "tagName"
    */
        var ImageGallery = {
            tags: function(tagName) {
                return "https://api.instagram.com/v1/tags/" + tagName + "/media/recent?access_token=35376971.52c688d.7841812059474470834c3b5dbbd5bfa8";
            },
            getImages: function(tag, callback) {
                // ajax call get information from Third Party - Instamgram
                $.ajax({
                    url: ImageGallery.tags(tag),
                    cache: true,
                    dataType: 'jsonp',
                    success: function(response, status) {
                        callback(response.data, status);
                    },
                    error: function(e) {
                        Notice.error("");
                    }
                });
            }
        };

        // Model 
        /*
        Model for the UI Place List which Contains the
        list of all the Places that are relevant to the
        current search and will be used to render
        the places list in the DOM
    */
        var PlaceModel = {
            // Initialize the Search with an emptry String
            search: ko.observable(''),

            placesBackUp: [],

            doSearch: function doSearch() {
                PlaceModel.placesBackUp = PlaceModel.places();

                for (var i = 0; i < PlaceModel.places().length; i += 1) {
                    var place = PlaceModel.places()[i];
                    var search = new RegExp(PlaceModel.search(), "i");

                    /*
            If the Search has no data
            Make all results available
        */
                    if (search.test(place.name)) {
                        place.visible(true);
                    } else {
                        place.visible(false);
                    }
                }
            },

            places: ko.observableArray([]), //ko.observable([]),

            import: function(list) {
                // call the server to give us the data
                list.forEach(function(place) {
                    var newPlace = new PlaceModel.Place(place);

                    PlaceModel.places.push(newPlace);
                });
            },

            selectedPlaceImages: ko.observableArray([]),

            Place: function Place(obj) {
                this.name = obj.name;

                this.original = obj;
                this.position = obj.geometry.location;
                this.visible = ko.observable(true);

                var marker = appMap.markerList(this);

                this.marker = marker;

                var openClosed = (obj.opening_hours && obj.opening_hours.open_now) ? "Open" : "Closed";

                var content = [
                    "<h2>" + this.name + "</h2>",
                    "<h3>" + obj.vicinity + "</h3>",
                    "<div>" + openClosed + "</div>"
                ];

                var infowindow = this.infowindow = new google.maps.InfoWindow({
                    content: content.join(""),
                    maxWidth: 250
                });

                infowindow.addListener('close', function() {
                    markerStopAnimate(marker);
                });

                this.images = [];

                var openWindow = this.open = function openWindow() {
                    // open this place in map
                    for (var i = 0; i < PlaceModel.places().length; i += 1) {
                        PlaceModel.places()[i].infowindow.close();
                        markerStopAnimate(PlaceModel.places()[i].marker);
                    }
                    infowindow.open(appMap.map, this.marker);

                    markerToggleAnimate(this.marker);

                    // if image is empty, then skip getting images from Instamgram
                    if (!this.images.length) {
                        var tag = (obj && obj.types) ? obj.types[0] : "bar";

                        ImageGallery.getImages(tag, function(data) {
                            this.images = data;

                            PlaceModel.selectedPlaceImages(this.images);
                        }.bind(this));
                    }
                }.bind(this);

                // added timeout to stop marker bouncing after 2 seconds.
                function markerAnimate(marker) {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        markerStopAnimate(marker);
                    }, 2000);
                }

                function markerStopAnimate(marker) {
                    marker.setAnimation(null);
                }

                // added animation function to the marker
                function markerToggleAnimate(marker) {
                    if (marker.getAnimation() !== null) {
                        markerStopAnimate(marker);
                    } else {
                        markerAnimate(marker);
                    }
                }

                marker.addListener('click', function() {
                    openWindow();
                });
            }
        };

        root.PlaceModel = PlaceModel;

        // Controller
        var LocationController = function LocationController() {
            console.log("Controller Loction started...");

            var map = appMap.init();

            appMap.getPlaces(function(results, status) {
                PlaceModel.import(results);
                console.log(PlaceModel.places); // to see the location objects

                ko.applyBindings(PlaceModel);
            });
        };

        LocationController();
    }
})(this); //Call The Anonymous function