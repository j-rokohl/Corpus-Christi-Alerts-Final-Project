// Get weather.gov graphicast images and check if urls are working.

fetch('https://www.weather.gov/source/crp/graphicast/graphicast.xml')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const xmlText = event.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText,
                'application/xml');
            const graphicasts = xmlDoc.querySelector('graphicasts');
            const count = graphicasts.childElementCount;
            const graphics = [];
            let imageCount = 0;

            // Change Needed Data to Array
            for (let i = 0; i < count; i++) {
                // Link
                const link = graphicasts.children[i].getElementsByTagName("FullImage")[0].innerHTML;

                // Expires
                const expires = graphicasts.children[i].getElementsByTagName("EndTime")[0].innerHTML;
                const expiresDate = new Date(expires * 1000);
                const currentDate = new Date();

                // Title Clean
                const title1 = graphicasts.children[i].getElementsByTagName("title")[0].innerHTML;
                const titleFirstClean = title1.split("<![CDATA[");
                const title2 = titleFirstClean[1];
                const titleSecondClean = title2.split("]]>");

                // Desc Clean
                const description1 = graphicasts.children[i].getElementsByTagName("description")[0].innerHTML;
                const descFirstClean = description1.split("<![CDATA[");
                const description2 = descFirstClean[1];
                const descSecondClean = description2.split("]]>");

                // Function to Check Link
                function status(addLink) {
                    return fetch(addLink, {
                        method: 'GET',
                    })
                        .then(function (response) {

                            let node = document.createElement('div');
                            node.classList.add("col");

                            if (response.status === 200 && currentDate <= expiresDate) {
                                imageCount++; // Number images that are added to the page

                                // Cache Images from weather.gov
                                caches.open('corpus-christi-alerts-v2').then(function (cache) {
                                    // Cache is now accessible
                                    cache.add(link);
                                });

                                if (imageCount > 2) {
                                    node.classList.add("s12");
                                    node.classList.remove("l6");
                                    node.classList.add("l4");
                                }

                                else {
                                    node.classList.add("s12");
                                    node.classList.add("l6");
                                }

                                node.innerHTML =
                                    '<h5 id="title-' + [i] + '">' + titleSecondClean[0] + '</h5><a href="' + link + '"><img style="width: 100%;" alt="' + titleSecondClean[0] + '" id="img-' + [i] + '"  src="' + link + '"></a><p id="desc-' + [i] +
                                    '">' + descSecondClean[0] + '</p>'
                                    ;

                                document.getElementById("photos").appendChild(node);
                            }
                        })
                        .then(function (response) {

                            const options = {
                                month: 'long', // Full month 
                                day: 'numeric', // Day
                                year: 'numeric' // Year
                            };

                            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(currentDate);

                            document.getElementById("dateData").innerHTML = formattedDate;
                            document.getElementById("dateDataSm").innerHTML = formattedDate;

                        })
                }

                try {
                    status(link);
                }
                catch (e) {
                    console.error("Broken: ", e);
                }

                //Add Object
                const newObj = {
                    link: link,
                    title: titleSecondClean[0],
                    desc: descSecondClean[0],
                    //status: thisStatus
                };
                graphics.push(newObj);
            }

            console.log(graphics);
        };
        reader.readAsText(blob);
    })
    .catch(error => {
        console.error(`There was a problem with
                       the fetch operation:`, error);
    });