function getWeather() {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name!");
        return;
    }

    fetch(`/weather?city=${city}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                document.getElementById("weather-info").innerHTML = `
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Weather: ${data.weather[0].description}</p>
                    <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
                `;
            } else {
                document.getElementById("weather-info").innerHTML = `<p style="color: red;">${data.message}</p>`;
            }
        })
        .catch(error => {
            document.getElementById("weather-info").innerHTML = `<p style="color: red;">Error fetching data</p>`;
        });
}
