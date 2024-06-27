// ver 2.0 行き先ごとに検索結果を出す 先頭５つのみ表示 もっと見るボタンの追加

document.getElementById('budget-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const budget = document.getElementById('budget').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '検索中...';

    const destinations = [
        {name: '那覇', IATA: 'OKA'},
        {name: '伊丹', IATA: 'ITM'}
    ];

    const apiKey = 'a590ad772dmsha969595af2a3814p1dd3cfjsn81509c26bc02';

    let allResults = {};

    for (const destination of destinations) {
        const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=${departure}&destinationAirportCode=${destination.IATA}&date=${departureDate}&itineraryType=ROUND_TRIP&sortOrder=PRICE&numAdults=1&numSeniors=0&classOfService=ECONOMY&returnDate=${returnDate}&pageNumber=1&nonstop=yes&currencyCode=JPY`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
                }
            });
            const data = await response.json();
            
            if (data.data.flights) {
                allResults[destination.IATA] = data.data.flights
                    .filter(flight => flight.purchaseLinks[0].totalPrice <= budget)
                    .sort((a, b) => a.purchaseLinks[0].totalPrice - b.purchaseLinks[0].totalPrice);
            }
        } catch (error) {
            console.error(`Error fetching data for destination ${destination.IATA}:`, error);
        }
    }

    resultsDiv.innerHTML = '';

    if (Object.keys(allResults).length === 0) {
        resultsDiv.innerHTML = '該当する目的地が見つかりませんでした。';
    } else {
        for (const [destinationIATA, flights] of Object.entries(allResults)) {
            const destination = destinations.find(dest => dest.IATA === destinationIATA);

            const destinationBlock = document.createElement('div');
            destinationBlock.className = 'destination-block';

            const destinationTitle = document.createElement('h3');
            destinationTitle.textContent = destination.name;
            destinationBlock.appendChild(destinationTitle);

            const flightsToShow = flights.slice(0, 5);
            flightsToShow.forEach(flight => {
                const item = document.createElement('div');
                item.className = 'result-item';
                
                flight.segments.forEach(segment => {
                    segment.legs.forEach(leg => {
                        const flightInfo = document.createElement('div');
                        flightInfo.className = 'flight-info';
                        const duration = calculateFlightDuration(leg.departureDateTime, leg.arrivalDateTime);
                        flightInfo.innerHTML = `
                            <p>出発: ${new Date(leg.departureDateTime).toLocaleString()}</p>
                            <p>到着: ${new Date(leg.arrivalDateTime).toLocaleString()}</p>
                            <p>搭乗時間: ${duration}</p>
                        `;
                        item.appendChild(flightInfo);
                    });
                });

                const priceInfo = document.createElement('div');
                priceInfo.className = 'flight-info';
                priceInfo.innerHTML = `
                    <p>料金: ${flight.purchaseLinks[0].totalPrice} 円</p>
                `;
                item.appendChild(priceInfo);

                const bookingLink = document.createElement('a');
                bookingLink.href = flight.purchaseLinks[0].url;
                bookingLink.textContent = "サイト＞";
                bookingLink.target = "_blank";
                item.appendChild(bookingLink);

                destinationBlock.appendChild(item);
            });

            if (flights.length > 5) {
                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'もっと見る';
                showMoreButton.addEventListener('click', () => {
                    flights.slice(5).forEach(flight => {
                        const item = document.createElement('div');
                        item.className = 'result-item';

                        flight.segments.forEach(segment => {
                            segment.legs.forEach(leg => {
                                const flightInfo = document.createElement('div');
                                flightInfo.className = 'flight-info';
                                const duration = calculateFlightDuration(leg.departureDateTime, leg.arrivalDateTime);
                                flightInfo.innerHTML = `
                                    <p>出発: ${new Date(leg.departureDateTime).toLocaleString()}</p>
                                    <p>到着: ${new Date(leg.arrivalDateTime).toLocaleString()}</p>
                                    <p>搭乗時間: ${duration}</p>
                                `;
                                item.appendChild(flightInfo);
                            });
                        });

                        const priceInfo = document.createElement('div');
                        priceInfo.className = 'flight-info';
                        priceInfo.innerHTML = `
                            <p>料金: ${flight.purchaseLinks[0].totalPrice} 円</p>
                        `;
                        item.appendChild(priceInfo);

                        const bookingLink = document.createElement('a');
                        bookingLink.href = flight.purchaseLinks[0].url;
                        bookingLink.textContent = "サイト＞";
                        bookingLink.target = "_blank";
                        item.appendChild(bookingLink);

                        destinationBlock.appendChild(item);
                    });
                    showMoreButton.style.display = 'none';
                });
                destinationBlock.appendChild(showMoreButton);
            }

            resultsDiv.appendChild(destinationBlock);
        }
    }
});

function calculateFlightDuration(departureDateTime, arrivalDateTime) {
    const departureTime = new Date(departureDateTime);
    const arrivalTime = new Date(arrivalDateTime);
    const duration = new Date(arrivalTime - departureTime);

    const hours = duration.getUTCHours();
    const minutes = duration.getUTCMinutes();

    return `${hours}時間${minutes}分間`;
}
