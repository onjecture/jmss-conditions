const LAT = -37.9125;
const LON = 145.1347;

const API_URL = 
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Australia/Melbourne`;

const weatherCodes = {
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
    71: "Snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm"
};


async function loadWeather() {

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        const weather = data.current;


        const temperature = weather.temperature_2m;
        const humidity = weather.relative_humidity_2m;
        const wind = weather.wind_speed_10m;
        const rain = weather.precipitation;
        const code = weather.weather_code;


        updateText("temperature", `${temperature}°C`);
        updateText("humidity", `${humidity}%`);
        updateText("wind", `${wind} km/h`);
        updateText("rain", `${rain} mm`);
        updateText(
            "condition",
            weatherCodes[code] || "Unknown"
        );


        updateTemperatureColour(temperature);

        updateRainMode(rain);

        updateLiveStatus();


        const now = new Date();

        updateText(
            "updated",
            `Updated ${now.toLocaleTimeString("en-AU")}`
        );


        checkNightMode();


    } catch(error) {

        console.error("Weather data error:", error);

        updateText(
            "status",
            "Data unavailable"
        );

    }

}



function updateText(id, value) {

    const element = document.getElementById(id);

    if(element) {
        element.textContent = value;
    }

}



function updateTemperatureColour(temp) {

    const indicator =
        document.getElementById("temperature-indicator");

    if(!indicator) return;


    let percentage =
        Math.min(Math.max((temp + 5) / 45, 0), 1);


    const blue = 255 - (percentage * 255);
    const red = percentage * 255;


    indicator.style.background =
    `rgb(${red}, 80, ${blue})`;

}



function updateRainMode(rain) {

    document.body.classList.remove(
        "rain-mode"
    );


    if(rain > 0) {

        document.body.classList.add(
            "rain-mode"
        );

    }

}



function updateLiveStatus() {

    const status =
        document.getElementById("status");


    if(status) {

        status.textContent =
        "LIVE DATA";

        status.classList.add(
            "online"
        );

    }

}



function checkNightMode() {

    const hour =
    new Date().getHours();


    if(hour >= 18 || hour < 7) {

        document.body.classList.add(
            "night-mode"
        );

    } else {

        document.body.classList.remove(
            "night-mode"
        );

    }

}



loadWeather();


setInterval(
    loadWeather,
    10 * 60 * 1000
);
