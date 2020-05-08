
// on dom load
$(document).ready(function() {
    // city search input field
    $("#cityQuery").on({
        "click" : function(event) {    // on click
            event.preventDefault();     // prevent default
            $("#cityQuery").css("color", "black");     // change text to black
        },
        "keydown" : function(event) {   // on keypress
            $("#cityQuery").css("color", "black");     // change text to black
            
            clearTimeout(searchTimer);    // clear previous timeout, if any
            var searchTimer = setTimeout(   // set timeout
                function() {
                    autoComplete();    // call autocomplete
                },
                1000   // 1000 milliseconds (1 second)
            );   

            if (event.originalEvent.key == "Enter") {  // if key is enter
                cityQuery = $("#cityQuery").val();  // get value from city search input field
                initiateSearch();   // initiate search for city
            }
        }
    });

    // auto-complete search
    function autoComplete() {
        cityQuery = $("#cityQuery").val();  // get value from city search input field
        $.ajax({     // ajax call for city lookup
            "async": true,      // city lookup api parameters
            "crossDomain": true,
            "url": "https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php?location=" + cityQuery,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "devru-latitude-longitude-find-v1.p.rapidapi.com",
                "x-rapidapi-key": "d22c1ef6ddmshc7c20de1815c23cp1cc60ejsnd4912e537f70"  // api key
            }
        }).then(function(response) {    // ajax request for cities
            var cityResults = response.Results;    // get results
            if (cityResults.length > 0) {    // if results array not empty
                resetAutoComplete();    // reset auto-complete
                for (var i = 0; i < cityResults.length; i++) {  // for all results
                    var citySuggestion = cityResults[i].name;     // get city name or coordinates
                    var newSuggestion = $("<button>").addClass("px-3 py-2 rounded-0 list-group-item list-group-item-action");
                    newSuggestion.text(citySuggestion);  // add class & text content
                    newSuggestion.type = "button";    // change type for css

                    $("#autoComplete").append(newSuggestion);    // append to autocomplete

                    if (i == 7) { break; }  // break loop after 8 suggestions
                }

                $("#autoComplete").css("display", "block");    // display auto-complete
            }
        });
    }
    
    function resetAutoComplete() {    // reset auto-complete list group
        $("#autoComplete").empty();  // empty auto-complete
        $("#autoComplete").css("display", "none");    // list group display none 
    }

    $("#autoComplete").on("click", function(event) {   // on click auto-complete city suggestion button
        if (event.target.matches("button")) {      // if button
            cityQuery = event.target.textContent;  // get city result name
            initiateSearch();   // initiate search for city
        }
    });

    // initiate query
    function initiateSearch() {
        cityQuery.trim();     // trim spaces on either side
        cityQuery.replace(/ /g, "+");  // replace inner spaces with '+' - global

        resetAutoComplete();   // reset auto-complete
        cityLocationSearch();    // search possible cities for coordinates
    }

    // search button
    var searchButton = $("#searchButton");   // get search button
    searchButton.on("click", function(event) {   // on click
        event.preventDefault();    // prevent default
        if (event.target.matches("button") || event.target.matches("img")) {   // if search button or img icon
            cityQuery = $("#cityQuery").val();  // get value from city search input field
            initiateSearch();   // initiate search for city
        }
    });
    
    // invalidate coordinates
    function invalidateCoords() {   
        var errorMessage = "City not found."   // change city search input field value to 'City not found.'
        $("#cityQuery").css("color", "red").val(errorMessage);    // change text color to red
        coordsValid = false;    // set coordsvalid to false to cut ajax chain
    }

    // get coordinates via City Geo-Location Lookup API (latitude, longitude)
    var coordsValid = true;   // boolean for gate control
    var cityQuery = "";       // city search input
    var currentCity = "Los Angeles, CA";    // variable name to be added - default location is los angeles

    function cityLocationSearch() {    // city search via name for coordinates
        $.ajax({     // ajax call for city lookup
            "async": true,      // city lookup api parameters
            "crossDomain": true,
            "url": "https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php?location=" + cityQuery,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "devru-latitude-longitude-find-v1.p.rapidapi.com",
                "x-rapidapi-key": "d22c1ef6ddmshc7c20de1815c23cp1cc60ejsnd4912e537f70"  // api key
            }
        }).then(function(response) {   
            // find first valid coordinates
            var cityResults = response.Results;
            if (cityResults.length > 0) {    // if results array not empty
                for (var i = 0; i < cityResults.length; i++) {  // for all results
                    latitude = cityResults[i].lat;    // get city latitude
                    longitude = cityResults[i].lon;    // get city longitude

                    if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {    // if coordinates valid
                        currentCity = cityResults[i].name;     // get city name or coordinates
                        break;   // break loop
                    }
                }

                 // if loop finishes
                if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {  // but coordinates are not valid
                    invalidateCoords();   // invalidate coordinates
                    return;      // terminate function - NOTE: this will not stop ajax chain
                }
                
                // if coordinates are valid
                if (!searchHistory.includes(currentCity)) {    // if current city is not in search history
                    if (searchHistory.length >= 8) {   // check for search history limit, if greater
                        searchHistory.pop();    // pop last from array
                        $("#searchHistory div").last()[0].remove();   // remove last child from search history
                    }
                    addCity(currentCity);   // prepend new city to search history
                    searchHistory.unshift(currentCity);   // unshift to search history array
                    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));   // store array
                }

                $("#cityQuery").val("");  // clear search
            } else {    // if no results
                invalidateCoords();   // invalidate coordinates
            }
        }).then(function() {      // no function to stop ajax chain in ES6 - uncancellable by default
            if (coordsValid) { cityWeatherSearch(); }   // if coordinates valid, proceed to get weather forecast
            else { coordsValid = true; }   // else set coordsvalid back to true and end chain
        });
    }

    // get weather via coordinates with One call openweatermap api (current, daily 8 day forecast, 48 hourly)
    var latitude = 34.052235;    // variable to store latitude - default to los angeles
    var longitude = -118.243683;   // variable to store longitude - default to los angeles
    var apiKey = "0d1a6b20e92136b4c5b57e307c6cf907"; // api key

    function cityWeatherSearch() {  // weather search for city via coordinates
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude +
                    "&units=imperial&exclude=hourly&appid=" + apiKey,  // imperial units, exclude hourly
            method: "GET",
            error: function(response, status, error) {   // error handler - stops ajax chain
                var errorMessage = status + " " + response.status + ": " + error;  // change city search input field value to error
                $("#cityQuery").css("color", "red").val(errorMessage);    // change text color to red
            }
        }).then(function(response) {
            fillWeatherForecast(response);   // fill weather forecast with response
        });
    }

    // fill current and 5-day forecast
    function fillWeatherForecast(response) {   
        $("#cityName").text(currentCity);      // city name is currentcity
        $("#date").text(moment().format('M/D/YYYY'));   // use moment.js - 8/16/2020

        var weatherIconCode = response.current.weather[0].icon;  // get current weather icon code
        $("#weatherIcon").attr("src", "https://openweathermap.org/img/wn/" + weatherIconCode + "@2x.png"); // img src via link

        $("#temperature").text(response.current.temp);   // set current temperature
        $("#humidity").text(response.current.humidity);   // set current humidity
        $("#windSpeed").text(response.current.wind_speed);  // set current wind speed

        var uvIndex = $("#uvIndex");    // get current uvi field
        var currentUVI = response.current.uvi;    // get current uvi
        uvIndex.text(currentUVI);    // set current uvi
        if (currentUVI < 3) {       // if uvi < 3
            uvIndex.css("background-color", "green");    // uvi container - green
        } else if (currentUVI >= 3 && currentUVI < 6) {   // if 3 <= uvi < 6
            uvIndex.css("background-color", "yellow");   // uvi container - yellow
        } else if (currentUVI >= 6 && currentUVI < 8) {   // if 6 <= uvi < 8
            uvIndex.css("background-color", "orange");   // uvi container - orange
        } else if (currentUVI >= 8 && currentUVI < 10) {   // if 8 <= uvi < 10
            uvIndex.css("background-color", "red");       // uvi container - red
        } else if (currentUVI >= 10) {                     // if 10 <= uvi
            uvIndex.css("background-color", "fuchsia");   // uvi container - fuchsia
        }

        // fill 5-day forecast
        $("#forecast").empty();   // empty forecast
        var forecast = response.daily;  // get daily array from response
        for (var i = 0; i < 5; i++) {       // 5 forecasts
            var forecastCard = $("<div>").addClass("mr-1 bg-primary border rounded-sm");  // forecast card
            forecastCard.css({"min-width" : "150px", "height" : "182px"});  // forecast card style

            var column = $("<div>").addClass("col-12 text-white");  // forecast card colum for alignment

            var dateRow = $("<div>").addClass("row mt-2 p-2");    // row for date
            var date = $("<h6>").text((moment().month() + 1) + "/" + (moment().date() + (i + 1))
                                        + "/" + moment().year()); // use moment.js
            dateRow.append(date);    // append date to row
        
            var iconRow = $("<div>").addClass("row pl-2");  // row for icon
            var icon = $("<img>");  // create img element for icon
            icon.attr("alt", "forecast");  // add alt
            icon.attr("src", "https://openweathermap.org/img/wn/" + forecast[i].weather[0].icon + "@2x.png"); // add src via link
            icon.width(50);  // img width 50px
            icon.height(50);  // img height 50px
            iconRow.append(icon);  // append icon to row
            
            var tempRow = $("<div>").addClass("row pl-2"); // row for temp
            var temp = $("<p>").text("Temp: " + forecast[i].temp.day + "° F"); // set temp
            tempRow.append(temp); // append temp to row
        
            var humidityRow = $("<div>").addClass("row pl-2");  // row for humidity
            var humidity = $("<p>").text("Humidity: " + forecast[i].humidity + " %");  // set humidity
            humidityRow.append(humidity);  // append humidity to row
       
            column.append(dateRow);   // append date row to column
            column.append(iconRow);   // append icon row to column
            column.append(tempRow);   // append temp row to column
            column.append(humidityRow);   // append humidity row to column
            forecastCard.append(column);   // append column to forecastCard
            $("#forecast").append(forecastCard);   // append forecastCard to forecast field
        }
    }

    // search history on click
    $("#searchHistory").on("click", function(event) {
        event.preventDefault();   // prevent default
        if (event.target.matches("button")) {     // if button or div
            cityQuery = event.target.textContent;    // set city Query to text content
        } else if (event.target.matches("div")) {
            cityQuery = event.target.firstChild.textContent;
        }

        initiateSearch();   // initiate search
    });

    // add city to search history
    function addCity(newCity) {    
        var cityToAdd = $("<div>").addClass("row");  // create div & add row class
        if (searchHistory.length > 0) {   // if not adding first child
            cityToAdd.addClass("border-bottom"); // add bottom border
        }

        var buttonToAdd = $("<button>").addClass("btn my-1 ml-1");   // create button & add classes 
        buttonToAdd.text(newCity);   // add text
        
        cityToAdd.append(buttonToAdd);   // append button to div
        $("#searchHistory").prepend(cityToAdd);    // prepend div to search history
    }

    // fill search history from local storage
    var searchHistory = [];    // search history array

    function fillSearchHistory() {   // fill search history
        var tempHistory = JSON.parse(localStorage.getItem("searchHistory"));  // get search history
        if (tempHistory == null) { return; }  // if item doesn't exist, return

        searchHistory = tempHistory;   // copy array
        for (var i = searchHistory.length - 1; i >= 0; i--) {   // for all items from last element to first
            addCity(searchHistory[i]);  // append via reverse prepend
        }
    }

    // user location search allowed
    function allowPosition(positionObject) {  // callback success for geolocation.getCurrentPosition
        latitude = positionObject.coords.latitude;  // get latitude
        longitude = positionObject.coords.longitude;  // get longitude
        currentCity = "Current Location";   // no reverse geo-coding to find city name - set to 'current location'

        cityWeatherSearch();  // get weather forecast with user coordinates
    }

    // user location search blocked
    function blockPosition(positionObject) {  // callback failure for geolocation.getCurrentPosition
        return;   // to wait for user permission to get location & change weather forecast
    }

    // main function
    function main() {
        if (navigator.geolocation) {   // get location permission
            navigator.geolocation.getCurrentPosition(allowPosition, blockPosition);  // waits for user permission
        }

        // while waiting for user permission
        fillSearchHistory();  // fill search history

        if (searchHistory.length > 0) {    // if search history not empty
            cityQuery = searchHistory[0];   // get last searched city
            initiateSearch();    // fill initial weather info based on last stored city name
        } else {
            cityWeatherSearch();  // fill weather forecast with default location - los angeles
        }
    }

    // call main
    main();
});