document.getElementById('budget-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const budget = document.getElementById('budget').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '検索中...';

    const destinations = [
        {name: '那覇', IATA: 'OKA'}
        //{name: '伊丹', IATA: 'ITM'}
    ];

    const apiKey = 'a590ad772dmsha969595af2a3814p1dd3cfjsn81509c26bc02'; // Replace with your actual API key

    let allResults = [];

    for (const destination of destinations) {
        const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=${departure}&destinationAirportCode=${destination.IATA}&date=${departureDate}&itineraryType=ROUND_TRIP&sortOrder=PRICE&numAdults=1&numSeniors=0&classOfService=ECONOMY&returnDate=${returnDate}&pageNumber=1&currencyCode=USD`;
        
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
                data.data.flights.forEach(flight => {
                    const price = flight.purchaseLinks[0].totalPrice;
                    if (price <= budget) {
                        allResults.push({flight: flight, destination: destination});
                    }
                });
            }
        } catch (error) {
            console.error(`Error fetching data for destination ${destination.IATA}:`, error);
        }
    }

    resultsDiv.innerHTML = '';

    if (allResults.length === 0) {
        resultsDiv.innerHTML = '該当する目的地が見つかりませんでした。';
    } else {
        allResults.sort((a, b) => a.flight.purchaseLinks[0].totalPrice - b.flight.purchaseLinks[0].totalPrice);

        allResults.forEach(result => {
            const flight = result.flight;
            const destination = result.destination;
            
            const item = document.createElement('div');
            item.className = 'result-item';
            
            flight.segments.forEach(segment => {
                segment.legs.forEach(leg => {
                    const flightInfo = document.createElement('div');
                    flightInfo.className = 'flight-info';
                    flightInfo.innerHTML = `
                        <p>出発日時: ${new Date(leg.departureDateTime).toLocaleString()}</p>
                        <p>到着地: ${destination.name}</p>
                        <p>搭乗時間: ${leg.distanceInKM} km</p>
                    `;
                    item.appendChild(flightInfo);
                });
            });

            const priceInfo = document.createElement('div');
            priceInfo.className = 'flight-info';
            priceInfo.innerHTML = `
                <p>料金: ${flight.purchaseLinks[0].totalPrice} USD</p>
            `;
            item.appendChild(priceInfo);

            const bookingLink = document.createElement('a');
            bookingLink.href = flight.purchaseLinks[0].url;
            bookingLink.textContent = "サイト＞";
            bookingLink.target = "_blank";
            item.appendChild(bookingLink);

            resultsDiv.appendChild(item);
        });
    }
});
