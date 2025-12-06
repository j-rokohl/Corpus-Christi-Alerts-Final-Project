// Get weather.gov alerts

const apiUrlTwo = 'https://api.weather.gov/alerts?zone=TXC355';

function isDateInPast(date) {
    return new Date(date) < new Date();
};

fetch(apiUrlTwo)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const features = data.features;
        let formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });
        let div = document.getElementById("alert");

        function copyAlert(txtId, btnId) {
            let textAreaId = document.getElementById(txtId);
            let buttonId = document.getElementById(btnId);

            buttonId.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(textAreaId.value);
                    M.toast({ html: 'Text copied!' });
                } catch (err) {
                    console.error(err.name, err.message);
                }
            });
        }

        for (let i = 0; i < features.length; i++) {
            try {
                let effectiveStart = new Date(features[i].properties.onset);
                let effectiveEnd = new Date(features[i].properties.ends);

                let status = (isDateInPast(features[i].properties.expires)) === true ? "Past Event" : "Active Now";

                let statusColor = (isDateInPast(features[i].properties.expires) === true) ? "#636363" : "#000000";

                let display = document.createElement('div');

                let alertId = features[i].properties.parameters.VTEC;
                
                let alertIdString = alertIDCheck(alertId);
                function alertIDCheck (ID) {
                    if (ID){
                        let stringVar = alertId.toString().slice(1, -1);
                        return stringVar;
                    }
                }

                let alertButton = 'btn-' + alertIdString;

                if (features[i].properties.status === 'Actual') {
                    display.innerHTML =
                        '<div class="row">' +
                        '<div class="col-12">' +
                        '<div class="card blue-grey lighten-4">' +
                        '<div class="card-content black-text">' +
                        '<h5 style="margin-top: 0; color:' + statusColor + '"><strong>' + status + ': ' + features[i].properties.event + '</strong></h5>' +
                        '<p style="margin-top:  0;color:' + statusColor + '"><strong> Start Date: </strong>' + formatter.format(new Date(effectiveStart)) +
                        '<br><strong> End Date: </strong>' + formatter.format(new Date(effectiveEnd)) +
                        '<br><strong>' + features[i].properties.headline + '</strong>' +
                        '<br><strong>Description: </strong>' + features[i].properties.description + '</p>' +
                        '<textarea style="display: none;" id="' + alertIdString + '">' + status + ': ' + features[i].properties.event + '&#013;' +
                        'Start Date: ' + formatter.format(new Date(effectiveStart)) + '&#013;' +
                        'End Date: ' + formatter.format(new Date(effectiveEnd)) + '&#013;' +
                        features[i].properties.headline + '&#013;' +
                        'Description: ' + features[i].properties.description + '&#013;' +
                        '</textarea>' +
                        '</div>' +
                        '<div class="card-action">' +
                        '<button id="btn-' + alertIdString +
                        '" class="valign-wrapper deep-orange accent-4 white-text btn">' +
                        '<i class="material-icons" style="font-size: .8em;">content_copy</i> <span style="margin-bottom: 5px;">Copy Alert</span>' +
                        '</button>' +
                        '</div>' +
                        '</div></div></div>'
                        ;
                    document.getElementById("loaderDiv").classList.remove("loader"); // Remove Loader
                    document.getElementById("alertsCC").appendChild(display);
                    copyAlert(alertIdString, alertButton);
                }
            }
            catch (e) {
                console.error("Error Summary: ", e);
            }
        }
        console.log('Data fetched:', data);
        console.log(new Date(features[1].properties.parameters.eventEndingTime[0]));
        console.log(new Date());
        // Process the data here
    })
    .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
    });