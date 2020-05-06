
// api key - 0d1a6b20e92136b4c5b57e307c6cf907

// on dom load
$(document).ready(function() {
    // TODO - implement auto-complete search

    // get search button
    var searchButton = $("#searchButton");
    searchButton.on("click", function(event) {
        if (event.target.matches("button") || event.target.matches("img")) {
            cityQuery = $("#cityQuery").val();  // get value from input
            cityQuery.trim();     // trim spaces on either side
            cityQuery.replace(/ /g, "+");  // replace inner spaces with '+' - global
        }

        cityLocationSearch();
    });

    // get location via City Geo-Location Lookup API (latitude, longitude)
    var cityQuery = "";
    var currentCity = "";
    function cityLocationSearch() {
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": "https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php?location=" + cityQuery,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "devru-latitude-longitude-find-v1.p.rapidapi.com",
                "x-rapidapi-key": "d22c1ef6ddmshc7c20de1815c23cp1cc60ejsnd4912e537f70"  // api key
            }
        }).then(function(response) {
            if (response.Results.length > 0) {
                latitude = response.Results[0].lat;
                longitude = response.Results[0].lon;

                if (searchHistory.length >= 8) { searchHistory.pop(); }
                currentCity = response.Results[0].name;
                addCity(currentCity);   
                searchHistory.unshift(currentCity);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

                $("#cityQuery").val("");  // clear search
            } else {
                var errorMessage = "City not found."
                errorMessage.fontcolor("red");
                $("#cityQuery").val(errorMessage);  // text in red

                return;
            }
        }).then(cityWeatherSearch);
    }

    // one call api (current, daily 8 day forecast, exclude hourly)
    var latitude = 0;
    var longitude = 0;
    var apiKey = "0d1a6b20e92136b4c5b57e307c6cf907"; // api key
    function cityWeatherSearch() {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude +
                    "&units=imperial&exclude=hourly&appid=" + apiKey,
            method: "GET"
        }).then(fillWeatherForecast(response));
    }

    function fillWeatherForecast(response) {
        // fill current weather
        $("#cityName") = currentCity;
        $("#date").text(moment().format('M/D/YYYY'));   // use moment.js - 8/16/2020

        var weatherIconCode = response.current.weather[0].icon;
        $("#weatherIcon").attr("src", "https://openweathermap.org/img/wn/" + weatherIconCode + "@2x.png");  

        $("#temperature").text(response.current.temp);
        $("#humidity").text(response.current.humidity);
        $("#windSpeed").text(response.current.wind_speed);

        var uvIndex = $("#uvIndex");
        var currentUVI = response.current.uvi;
        uvIndex.text(currentUVI);
        if (currentUVI < 3) {
            uvIndex.css("background-color", "green");
        } else if (currentUVI >= 3 && currentUVI < 6) {
            uvIndex.css("background-color", "yellow");
        } else if (currentUVI >= 6 && currentUVI < 8) {
            uvIndex.css("background-color", "orange");
        } else if (currentUVI >= 8 && currentUVI < 10) {
            uvIndex.css("background-color", "red");
        } else if (currentUVI >= 10) {
            uvIndex.css("background-color", "purple");
        }

        // fill 5-day forecast
        var forecast = response.daily;
        for (var i = 0; i < 5; i++) {
            var forecastCard = $("<div>").addClass("mr-1 bg-primary border rounded-sm");
            forecastCard.css({"min-width" : "150px", "height" : "182px"});

            var column = $("<div>").addClass("col-12 text-white");

            var dateRow = $("<div>").addClass("row mt-2 p-2");
            var date = $("<h6>").text((moment().month() + 1) + "/" + (moment().date() + (i + 1))
                                        + "/" + moment().year()); // use moment.js
            dateRow.append(date);
        
            var iconRow = $("<div>").addClass("row pl-2");
            var icon = $("<img>");
            icon.attr("alt", "forecast");
            icon.attr("src", "https://openweathermap.org/img/wn/" + forecast[i].weather[0].icon + "@2x.png").load(
                function() {
                    this.width(50);
                    this.height(50);
            });
            iconRow.append(icon);
            
            var tempRow = $("<div>").addClass("row pl-2");
            var temp = $("<p>").text("Temp: " + forecast[i].weather[0].temp.day + "° F");
            tempRow.append(temp);
        
            var humidityRow = $("<div>").addClass("row pl-2");
            var humidity = $("<p>").text("Humidity: " + forecast[i].weather[0].humidity + " %");
            humidityRow.append(humidity);
       
            column.append(dateRow);
            column.append(iconRow);
            column.append(tempRow);
            column.append(humidityRow);
            forecastCard.append(column);
            $("#forecast").append(forecastCard);
        }
    }

    function addCity(newCity) {
        var cityToAdd = $("<div>");
        cityToAdd.addClass("row");
        if (searchHistory.length > 0) {
            cityToAdd.addClass("border-bottom");
        }

        var buttonToAdd = $("<button>");
        buttonToAdd.addClass("btn my-1 ml-1");
        buttonToAdd.text(newCity);
        
        cityToAdd.append(buttonToAdd);
        $("#searchHistory").append(cityToAdd);        
    }

    var searchHistory = [];
    function fillSearchHistory() {
        var tempHistory = JSON.parse(localStorage.getItem("searchHistory"));
        if (tempHistory == null) { return; }

        searchHistory = tempHistory;
        for (var i = 0; i < searchHistory.length; i++) {
            addCity(searchHistory[i]);
        }
    }

    // Main
    function positionSuccess(positionObject) {
        latitude = positionObject.coords.latitude;
        longitude = positionObject.coords.longitude;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess);
        currentCity = "Current Location";
    } else {
        latitude = 34.052235;
        longitude = -118.243683;
        currentCity = "Los Angeles, CA"
    }

    // cityWeatherSearch();  // fill weather forecast of default or current user location
    // fillSearchHistory();  // fill search history
});