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

    const apiKey = 'a590ad772dmsha969595af2a3814p1dd3cfjsn81509c26bc02'; // ここに取得したAPIキーを入力します

    let allResults = [];

    for (const destination of destinations) {
        const url = `https://tripadvisor1.p.rapidapi.com/flights/create-session?origin=${departure}&destination=${destination.IATA}&departureDate=${departureDate}&returnDate=${returnDate}&currency=JPY&adults=1`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Host': 'tripadvisor1.p.rapidapi.com',
                    'X-RapidAPI-Key': apiKey
                }
            });
            const data = await response.json();

            if (data.itineraries) {
                data.itineraries.forEach(itinerary => {
                    // 予算以下のフライトのみ追加
                    if (itinerary.pricingOptions[0].price.amount <= budget) {
                        allResults.push({itinerary: itinerary, destination: destination});
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
        // price.amountで昇順にソート
        allResults.sort((a, b) => a.itinerary.pricingOptions[0].price.amount - b.itinerary.pricingOptions[0].price.amount);

        allResults.forEach(result => {
            const itinerary = result.itinerary;
            const destination = result.destination;

            const item = document.createElement('div');
            item.className = 'result-item';

            const flightInfo = document.createElement('div');
            flightInfo.className = 'flight-info';
            flightInfo.innerHTML = `
                <p>出発地: ${departure}</p>
                <p>到着地: ${destination.name}</p>
                <p>料金: ${itinerary.pricingOptions[0].price.amount}円</p>
            `;
            item.appendChild(flightInfo);

            const bookingLink = document.createElement('a');
            bookingLink.href = `https://www.tripadvisor.com${itinerary.pricingOptions[0].deepLink}`;
            bookingLink.textContent = "サイト＞";
            bookingLink.target = "_blank";
            item.appendChild(bookingLink);

            resultsDiv.appendChild(item);
        });
    }
});
