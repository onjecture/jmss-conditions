const lat = -37.9125;
const lon = 145.1347;


const api =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Australia/Melbourne`;


const weatherText = {
    0:"Clear Sky",
    1:"Mainly Clear",
    2:"Partly Cloudy",
    3:"Overcast",
    45:"Fog",
    51:"Light Drizzle",
    53:"Drizzle",
    61:"Rain",
    63:"Rain",
    65:"Heavy Rain",
    80:"Rain Showers",
    81:"Heavy Showers",
    95:"Thunderstorm"
};



async function updateWeather(){

try{

const response = await fetch(api);
const data = await response.json();

const current = data.current;


document.getElementById("weather").textContent =
weatherText[current.weather_code] || "Unknown";


document.getElementById("temperature").textContent =
`${current.temperature_2m}°C`;


document.getElementById("feels-like").textContent =
`${current.apparent_temperature}°C`;


document.getElementById("humidity").textContent =
`${current.relative_humidity_2m}%`;


document.getElementById("pressure").textContent =
`${current.pressure_msl} hPa`;


document.getElementById("wind-speed").textContent =
`${current.wind_speed_10m} km/h`;


document.getElementById("wind-direction").textContent =
`${current.wind_direction_10m}°`;


document.getElementById("cloud-cover").textContent =
`${current.cloud_cover}%`;


document.getElementById("visibility").textContent =
`${(current.visibility / 1000).toFixed(1)} km`;


document.getElementById("rain").textContent =
`${current.precipitation} mm`;


document.getElementById("connection").textContent =
"Connected";


document.getElementById("last-updated").textContent =
new Date().toLocaleTimeString("en-AU");



loadForecast(data.daily);



}
catch(error){

console.error(error);

document.getElementById("connection").textContent =
"Connection Failed";

}

}




function loadForecast(daily){

const table =
document.getElementById("forecast");


if(!table) return;


table.innerHTML="";


for(let i=0;i<7;i++){

let row=document.createElement("tr");


row.innerHTML=`

<td>${daily.time[i]}</td>

<td>
${weatherText[daily.weather_code[i]] || "Unknown"}
</td>

<td>
${daily.temperature_2m_min[i]}°C
</td>

<td>
${daily.temperature_2m_max[i]}°C
</td>

<td>
${daily.precipitation_probability_max[i]}%
</td>

`;


table.appendChild(row);

}

}



updateWeather();


setInterval(
updateWeather,
600000
);
