let states = document.querySelector("#states");
let cities = document.querySelector("#cities");
let dates = document.querySelector("#dates");
let apiKey = "5fd2e8c6cbdb23adb7ad1e8a5c2650ea";

let lat;
let lon;

// --------------------------------------------------------------------------------------------------------
// function to get states
async function getStates() {
  let a = await fetch("./api/states.json");
  let response = await a.json();
  response.forEach(element => {
    states.innerHTML = states.innerHTML + `<option class="states" value="${element.name}">${element.name}</option>`;
  });
}

// --------------------------------------------------------------------------------------------------------
// function to get cities
async function getCities(state) {
  let a = await fetch("./api/cities.json");
  let response = await a.json();
  cities.innerHTML = "";
  let indexOfCity;
  for (let index = 0; index < response.length; index++) {
    if (response[index].state_name == state) {
      indexOfCity = index;
      break;
    }
  }
  let html;
  response[indexOfCity].cities.forEach(element => {
    html = html + `<option class="cities" value="${element.name}">${element.name}</option>`;
  });
  cities.innerHTML = cities.innerHTML + html;
}

// function to get lat and lan of city
async function geographic(city) {
  let a = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  let response = await a.json();
  // console.log(response[0].lat, response[0].lon);
  lat = response[0].lat;
  lon = response[0].lon;
}

// --------------------------------------------------------------------------------------------------------
// function to get current weather
async function currentWeather(lat, lon) {
  let a = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  let response = await a.json();
  // console.log(response);

  // updating date
  let date = new Date().toLocaleDateString('en-US');
  let time = new Date().toLocaleTimeString('en-US');
  document.querySelector("#time").innerHTML = `${time.split(":")[0]}:${time.split(":")[1]} ${time.split(" ")[1]}`;

  // updating temp
  let currentTemp = response.main.temp - 273.15;
  let temp = document.querySelector("#degree");
  temp.innerHTML = `${Math.floor(currentTemp)}<span>&#8451;</span>`;

  // updating forecast
  let mainForcast = response.weather[0].main;
  let forecast = document.querySelector("#forecast").innerHTML = response.weather[0].main;

  // updating forcast img
  let img = document.querySelector(".img");
  // console.log(img.innerHTML);
  let Imgurl = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
  img.innerHTML = ` <img src="${Imgurl}">`;

  // updating wind speed 
  document.querySelector("#wind-speed").lastElementChild.innerHTML = `${Math.floor(response.wind.speed * 3.6)}km/h`;

  // updating humidity 
  document.querySelector("#humidity").lastElementChild.innerHTML = `${response.main.humidity}%`;

  // updating sunrise time
  let sunrise = new Date(response.sys.sunrise * 1000);
  document.querySelector("#sunrise").lastElementChild.innerHTML = `${sunrise.toLocaleTimeString()}`;
}

// --------------------------------------------------------------------------------------------------------
async function datedrop(lat, lon) {
  let a = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  let response = await a.json();
  dates.innerHTML = `<option value="24 hrs">24 hrs</option>`;

  // showing dates dropdown
  let foreCastedDates = [];
  response.list.forEach((element) => {
    foreCastedDates.push(element.dt_txt.split(" ")[0]);
  });

  foreCastedDates = foreCastedDates.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  foreCastedDates.shift();
  foreCastedDates.forEach((element) => {
    dates.innerHTML = dates.innerHTML + `<option value="${element}">${element}</option>`;
  });
}

// --------------------------------------------------------------------------------------------------------
// function to get 3hour based 5 days forecast
async function weatherForecast(lat, lon, selectedDate) {
  let a = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  let response = await a.json();

  // storing weather forecast info
  let array2 = [];
  response.list.forEach((element) => {
    let obj = {
      'name': `${element.dt_txt.split(" ")[0]}`,
      'time': `${element.dt_txt.split(" ")[1]}`,
      'temp': `${Math.floor(element.main.temp - 273.15)}`
    }
    array2.push(obj);
  })

  // creating weatherChart
  let xValues = [];
  let yValues = [];

  if (selectedDate == "24 hrs") {
    for (let index = 0; index < 8; index++) {
      xValues.push(array2[index].time);
      yValues.push(array2[index].temp);
    }
  } else {
    array2.forEach((element) => {
      if (element.name == selectedDate) {
        xValues.push(element.time)
        yValues.push(element.temp)
      };
    });
  }

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{
        label: "Celcius",
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: yValues
      }]
    },
    options: {
      scales: {
        yAxes: [{ ticks: { min: 0, max: 50 } }],
      }
    }
  });
}


// --------------------------------------------------------------------------------------------------------
async function main() {
  await getStates();
  await getCities(states.value);
  await geographic(cities.value);
  await currentWeather(lat, lon);
  await datedrop(lat, lon, dates.value);
  await weatherForecast(lat, lon, dates.value);

  states.addEventListener("change", async (e) => {
    await getCities(e.currentTarget.value)
    await geographic(cities.value);
    await weatherForecast(lat, lon, dates.value);
    await datedrop(lat, lon, dates.value);
    currentWeather(lat, lon);
  });

  cities.addEventListener("change", async (e) => {
    await geographic(e.currentTarget.value);
    await weatherForecast(lat, lon, dates.value);
    await datedrop(lat, lon, dates.value);
    currentWeather(lat, lon);
  });

  dates.addEventListener("change", async (e) => {
    await weatherForecast(lat, lon, e.currentTarget.value);
  });
}
main();