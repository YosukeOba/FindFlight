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

    const apiKey = 'a590ad772dmsha969595af2a3814p1dd3cfjsn81509c26bc02'; // ここに取得したAPIキーを入力します

    let allResults = [];

    for (const destination of destinations) {
        const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlightsMultiCity?legs=%5B%7B%22sourceAirportCode%22%3A%22${departure}%22%2C%22destinationAirportCode%22%3A%22${destination.IATA}%22%2C%22date%22%3A%22${departureDate}%22%7D%2C%7B%22sourceAirportCode%22%3A%22${destination.IATA}%22%2C%22destinationAirportCode%22%3A%22${departure}%22%2C%22date%22%3A%22${returnDate}%22%7D%5D&classOfService=ECONOMY&sortOrder=PRICE&currencyCode=JPY`;
        
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (data.flights) {
                data.flights.forEach(flight => {
                    // 予算以下のフライトのみ追加
                    if (flight.price < budget) {
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
        // priceで昇順にソート
        allResults.sort((a, b) => a.flight.price - b.flight.price);

        allResults.forEach(result => {
            const flight = result.flight;
            const destination = result.destination;
            
            const item = document.createElement('div');
            item.className = 'result-item';

            const flightInfo = document.createElement('div');
            flightInfo.className = 'flight-info';
            flightInfo.innerHTML = `
                <p>出発地: ${departure}</p>
                <p>到着地: ${destination.name}</p>
                <p>料金: ${flight.price}円</p>
            `;
            item.appendChild(flightInfo);

            const bookingLink = document.createElement('a');
            bookingLink.href = flight.deepLink;
            bookingLink.textContent = "サイト＞";
            bookingLink.target = "_blank";
            item.appendChild(bookingLink);

            resultsDiv.appendChild(item);
        });
    }
});
