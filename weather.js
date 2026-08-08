const lat = -37.9125;
const lon = 145.1347;
const api =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,visibility,dew_point_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Australia/Melbourne`;

const weatherText = {
0:"Clear Sky",
1:"Mainly Clear",
2:"Partly Cloudy",
3:"Overcast",
45:"Fog",
48:"Depositing Rime Fog",
51:"Light Drizzle",
53:"Drizzle",
55:"Dense Drizzle",
56:"Freezing Drizzle",
57:"Dense Freezing Drizzle",
61:"Rain",
63:"Rain",
65:"Heavy Rain",
66:"Freezing Rain",
67:"Heavy Freezing Rain",
71:"Light Snow",
73:"Snow",
75:"Heavy Snow",
77:"Snow Grains",
80:"Rain Showers",
81:"Heavy Showers",
82:"Violent Showers",
85:"Snow Showers",
86:"Heavy Snow Showers",
95:"Thunderstorm",
96:"Thunderstorm with Hail",
99:"Severe Thunderstorm"
};

const rainCodes = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99];

let lastSuccessfulUpdate = null;

function setText(id,text){
    const el = document.getElementById(id);
    if(el){
        el.textContent = text;
    }
}

function formatValue(value,suffix){
    if(value === null || value === undefined || Number.isNaN(value)){
        return "--"+suffix;
    }
    return value+suffix;
}

function isRainCondition(weatherCode){
    return rainCodes.indexOf(weatherCode) !== -1;
}

function isNightTime(current,daily){
    try{
        if(current && current.time && daily && daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]){
            const now = new Date(current.time);
            const sunrise = new Date(daily.sunrise[0]);
            const sunset = new Date(daily.sunset[0]);
            if(!Number.isNaN(now.getTime()) && !Number.isNaN(sunrise.getTime()) && !Number.isNaN(sunset.getTime())){
                return now < sunrise || now >= sunset;
            }
        }
    }catch(error){
        console.error(error);
    }
    const melbourneHour = new Date(new Date().toLocaleString("en-US",{timeZone:"Australia/Melbourne"})).getHours();
    return melbourneHour < 6 || melbourneHour >= 20;
}

function updateAtmosphere(weatherCode,night){
    const rain = isRainCondition(weatherCode);

    document.body.classList.toggle("rain-mode",rain);
    document.body.classList.toggle("night-mode",night);

    let label = "Normal";
    if(night && rain){
        label = "Night + Rain";
    }else if(night){
        label = "Night";
    }else if(rain){
        label = "Rain";
    }

    setText("atmosphereStatus",label);
}

function initRain(){
    const overlay = document.getElementById("rainOverlay");
    if(!overlay || overlay.dataset.initialised === "true"){
        return;
    }
    overlay.dataset.initialised = "true";

    const dropCount = 45;
    for(let i=0;i<dropCount;i++){
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        const left = Math.random()*100;
        const height = 14+Math.random()*16;
        const duration = 0.7+Math.random()*0.9;
        const delay = Math.random()*2;
        const opacity = 0.25+Math.random()*0.35;
        drop.style.left = left+"%";
        drop.style.height = height+"px";
        drop.style.animationDuration = duration+"s";
        drop.style.animationDelay = delay+"s";
        drop.style.opacity = opacity;
        overlay.appendChild(drop);
    }

    const glassCount = 5;
    for(let i=0;i<glassCount;i++){
        const glass = document.createElement("div");
        glass.className = "rain-glass";
        glass.style.left = (Math.random()*90)+"%";
        glass.style.top = (Math.random()*90)+"%";
        overlay.appendChild(glass);
    }
}

function formatElapsed(ms){
    const seconds = Math.max(0,Math.floor(ms/1000));
    if(seconds < 60){
        return "Updated "+seconds+" second"+(seconds===1?"":"s")+" ago";
    }
    const minutes = Math.floor(seconds/60);
    if(minutes < 60){
        return "Updated "+minutes+" minute"+(minutes===1?"":"s")+" ago";
    }
    const hours = Math.floor(minutes/60);
    return "Updated "+hours+" hour"+(hours===1?"":"s")+" ago";
}

function updateTelemetryStatus(){
    const el = document.getElementById("telemetryStatus");
    if(!el){
        return;
    }
    if(!lastSuccessfulUpdate){
        el.textContent = "Waiting for first update...";
        return;
    }
    el.textContent = formatElapsed(Date.now()-lastSuccessfulUpdate.getTime());
}

function updateTemperatureMarker(temperature){
    const marker = document.getElementById("temperatureMarker");
    if(!marker){
        return;
    }
    if(temperature === null || temperature === undefined || Number.isNaN(temperature)){
        return;
    }
    const clamped = Math.min(Math.max(temperature/45*100,0),100);
    marker.style.left = clamped+"%";
}

async function updateWeather(){
    try{
        const response = await fetch(api);
        if(!response.ok){
            throw new Error("API failed");
        }
        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        setText("coordinates",`${lat}, ${lon}`);

        if(current && current.time){
            setText("currentDate",new Date(current.time).toLocaleDateString("en-AU"));
        }

        setText("weatherDescription",weatherText[current.weather_code] || "Unknown");
        setText("temperature",formatValue(current.temperature_2m," °C"));
        setText("temperatureValue",formatValue(current.temperature_2m," °C"));
        updateTemperatureMarker(current.temperature_2m);
        setText("apparentTemperature",formatValue(current.apparent_temperature," °C"));
        setText("dewPoint",formatValue(current.dew_point_2m," °C"));
        setText("humidity",formatValue(current.relative_humidity_2m,"%"));
        setText("pressure",formatValue(current.pressure_msl," hPa"));
        setText("windSpeed",formatValue(current.wind_speed_10m," km/h"));
        setText("windDirection",formatValue(current.wind_direction_10m,"°"));
        setText("cloudCover",formatValue(current.cloud_cover,"%"));

        if(current.visibility === null || current.visibility === undefined){
            setText("visibility","-- km");
        }else{
            setText("visibility",(current.visibility/1000).toFixed(1)+" km");
        }

        if(daily && daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined){
            setText("rainProbability",formatValue(daily.precipitation_probability_max[0],"%"));
        }

        setText("uvIndex",current.uv_index === null || current.uv_index === undefined ? "--" : current.uv_index);

        if(current && current.time){
            setText("lastUpdated",new Date(current.time).toLocaleTimeString("en-AU"));
        }

        setText("connectionStatus","Connected");

        lastSuccessfulUpdate = new Date();
        updateTelemetryStatus();

        const night = isNightTime(current,daily);
        updateAtmosphere(current.weather_code,night);

        if(daily){
            loadForecast(daily);
        }
    }
    catch(error){
        console.error(error);
        setText("connectionStatus","Connection Failed - showing cached data");
    }
}

function loadForecast(daily){
    const table = document.getElementById("forecastTable");
    if(!table){
        return;
    }
    table.innerHTML = "";
    for(let i=0;i<7;i++){
        const row = document.createElement("tr");
        const date = new Date(daily.time[i]).toLocaleDateString("en-AU",{weekday:"short"});
        const condition = weatherText[daily.weather_code[i]] || "Unknown";
        const min = daily.temperature_2m_min[i];
        const max = daily.temperature_2m_max[i];
        const rain = daily.precipitation_probability_max[i];
        row.innerHTML = `
<td>${date}</td>
<td>${condition}</td>
<td>${min}°C</td>
<td>${max}°C</td>
<td>${rain}%</td>
`;
        table.appendChild(row);
    }
}

initRain();
updateWeather();
setInterval(updateWeather,600000);
setInterval(updateTelemetryStatus,1000);
