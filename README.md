# Weather Forecast
BootCampSpot Web Development - Week 6 Homework

## Notes on Weather Forecast & APIs
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Weather forecasts predict the weather with
some accuracy for the coming two weeks or more. Generally reliable, forecasts are
used by people if they are planning for travel or other outings. People usually
get their information from media but nowadays, everyone gets this information
from their phone or websites. These apps makes the forecasts available via the
use of an api.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; An api (application programming interface)
is an interface that receives from and fulfills requests of developers that request
and retrieve information from them. Apis are written to provide all kinds of info
and services that people may find useful. For example, for weather forecasts, a
weather website by the name of openweathermap provides an api service for weather.
There are several apis on their website that range from getting info about current,
5-day three hour, 48-hourly, 16-daily, weather maps, and more. The majority of apis
either have a limit, price per request, or a monthly plan. 

## Motive & Action
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; For our case, we will be using free apis with
as much functionality as we can get. For our weather forecasts, we will be using the
One Call API from openweathermap as it provides ways to gather current, 48 hourly,
and 8-day forecasts with options to exclude parts from results, search by
coordinates, and get temperature by imperial units(F).

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Whether intentional or not, the One Call API
was rather hidden and obscurely named (maybe due to it being the most basic but free
complete package) with the slight inconvenience of having to search by coordinates.
However, searching by coordinates suits our needs perfectly because openweathermap
doesn't provide the most intuitive way of searching for the city in question, rather
relying on searching via their city ids. They do provide a list of their city ids,
but its unruly size makes it a hassle.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To search for our city, we will use a separate
api called City Geo-location Lookup, which is also free. This api allows developers
to search through their city database by city name, returning a list of possible
matching cities and their coordinates amongst other info. Below we will look at how 
each api is used on our weather dashboard along with notables.

* City Geo-location Lookup API
    - https://rapidapi.com/dev132/api/city-geo-location-lookup/
    - Unlimited calls
    - Requests return a list of cities that match the query (Max - 20)
        - Results will be ordered from most likely to least likely
        - Results can contain states & countries with out-of-bound coordinates (i.e. Somalia)
    - Requests return errors
        - Handle errors manually (0 Results, states & countries)
            - Notify user with error message in search input field
            - Gate control (out-of-bound coordinates)
        - Sometimes API goes down - Handle errors via AJAX
            - Notify user with error code & error status in search input field
    - Use to get city's coordinates to then use in One Call API
    - Use to get list of citites for auto-complete feature on search for disambiguation
    - NOTE: Server may be down without notice

* One Call API - OpenWeatherMap
    - https://openweathermap.org/api/one-call-api
    - Limited to 1000 calls a day
    - Requests return the following:
        - Current, Daily 8-day forecast, 48-hourly
    - Requests are made with required & optional parameters:
        - Required: Latitude & Longitude
        - Optional: Exclude part of requests (48-hourly), units (imperial)
    - Requests return errors
        - Errors:
            - Bad request (coordinates NaN or out of bounds)
            - API Key limit reached, expired, or invalid
        - Handle errors via AJAX
            - Notify user with error code & error status in search input field
    - Make AJAX request with latitude & longitude
        - Get weather icon, temperature, humidity, wind speed, UV index for current
        - Get weather icon, temperature, humidity for 5-day forecast

