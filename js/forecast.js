// Get weather.gov forecasts

const apiUrl = 'https://api.weather.gov/gridpoints/CRP/110,32/forecast';

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const periods = data.properties.periods;
    let formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let div = document.getElementById("weather");

    function copyForecast(txtId, btnId) {
      let textAreaId = document.getElementById(txtId);
      let buttonId = document.getElementById(btnId);

      buttonId.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(textAreaId.value);
          M.toast({html: 'Text copied!'});
        } catch (err) {
          console.error(err.name, err.message);
        }
      });
    }

    for (let i = 0; i < periods.length; i++) {
      let myDate = new Date(periods[i].startTime);
      let node = document.createElement('div');
      let forecastBtn = 'btn-' + periods[i].number;
      let forecastId = periods[i].number;
      node.innerHTML =
        '<div class="col s12 m6 l3" style="min-height: 34rem !important;">' +
        '<div class="card" style="min-height: 34rem;">' +
        '<div class="card-image">' +
        '<img src="' + periods[i].icon + '"' + ' alt="' + periods[i].shortForecast + '" />' +
        '<h6 class="card-title black-text" style="background-color: white; font-size: 1em;"><strong>' + periods[i].name + ', ' + formatter.format(myDate) + '</strong></h6>' +
        '<button class="btn-floating halfway-fab deep-orange accent-4"><i class="material-icons" id="btn-' + periods[i].number + '">content_copy</i></button>' +
        '</div>' +
        '<div class="card-content black-text">' +
        '<p class="truncate-multi-line"><strong>' + "Temperature: </strong>" + periods[i].temperature + periods[i].temperatureUnit +
        '<br><strong>' + "Wind Speed: </strong>" + periods[i].windSpeed +
        '<br><strong>' + "Wind Direction: </strong>" + periods[i].windDirection +
        '<br>' + periods[i].detailedForecast + '</p>' +
          '<textarea style="display: none;" id="' + periods[i].number + '">' + periods[i].name + ', ' + formatter.format(myDate) + '&#013;' + 
                'Temperature: ' + periods[i].temperature + periods[i].temperatureUnit + '&#013;' +
                'Wind Speed: ' + periods[i].windSpeed + '&#013;' +
                'Wind Direction: ' + periods[i].windDirection + '&#013;' +
                periods[i].detailedForecast + '&#013;' +
          '</textarea>' +
        '</div></div></div>'
        ;
      document.getElementById("loaderDiv").classList.remove("loader"); // Remove Loader
      document.getElementById("weather").appendChild(node);
      copyForecast(forecastId, forecastBtn);
    }
    console.log('Data fetched:', periods);
    // Process the data here
  })
  .catch(error => {
    console.error('Fetch error:', error);
    // Handle errors here
  });

function isDateInPast(date) {
  return new Date(date) < new Date();
};