const latitude = -37.9125;
const longitude = 145.1340;


const weatherURL =
`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,visibility,uv_index,dew_point_2m,weather_code&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Australia%2FMelbourne`;


const weatherDescriptions = {

    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm"

};


function update(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-AU",
        {
            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"
        }
    );

}


function formatTime(date) {

    return date.toLocaleTimeString(
        "en-AU",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}


function getWindDirection(degrees) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    return `${degrees}° ${directions[Math.round(degrees/45)%8]}`;

}



function loadWeather(data) {


    const current = data.current;


    update(
        "weatherDescription",
        weatherDescriptions[current.weather_code] || "Unknown"
    );


    update(
        "temperature",
        `${current.temperature_2m} °C`
    );


    update(
        "apparentTemperature",
        `${current.apparent_temperature} °C`
    );


    update(
        "dewPoint",
        `${current.dew_point_2m} °C`
    );


    update(
        "humidity",
        `${current.relative_humidity_2m} %`
    );


    update(
        "pressure",
        `${current.pressure_msl} hPa`
    );


    update(
        "windSpeed",
        `${current.wind_speed_10m} km/h`
    );


    update(
        "windDirection",
        getWindDirection(current.wind_direction_10m)
    );


    update(
        "cloudCover",
        `${current.cloud_cover} %`
    );


    update(
        "visibility",
        `${(current.visibility/1000).toFixed(1)} km`
    );


    update(
        "uvIndex",
        current.uv_index
    );


    update(
        "rainProbability",
        `${data.hourly.precipitation_probability[0]} %`
    );


    update(
        "lastUpdated",
        formatTime(new Date(current.time))
    );

}



function loadForecast(data) {


    const table =
    document.getElementById("forecastTable");


    table.innerHTML="";


    for(let i=0;i<7;i++){


        const date =
        new Date(data.daily.time[i]);


        const row =
        document.createElement("tr");


        row.innerHTML = `

        <td>
        ${date.toLocaleDateString("en-AU",
        {
            weekday:"short",
            day:"numeric"
        })}
        </td>

        <td>
        ${weatherDescriptions[data.daily.weather_code[i]]}
        </td>

        <td>
        ${data.daily.temperature_2m_min[i]} °C
        </td>

        <td>
        ${data.daily.temperature_2m_max[i]} °C
        </td>

        <td>
        ${data.daily.precipitation_probability_max[i]} %
        </td>

        `;


        table.appendChild(row);

    }


}



async function getWeather(){


    try{


        const response =
        await fetch(weatherURL);


        const data =
        await response.json();


        loadWeather(data);

        loadForecast(data);


        update(
            "connectionStatus",
            "Connected"
        );


    }


    catch(error){


        console.log(error);


        update(
            "connectionStatus",
            "Data unavailable"
        );


    }


}



function start(){


    update(
        "coordinates",
        `${latitude}, ${longitude}`
    );


    update(
        "currentDate",
        formatDate(new Date())
    );


    getWeather();


}



start();


setInterval(
    getWeather,
    600000
);
