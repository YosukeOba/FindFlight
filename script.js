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

    const apiKey = '667c39e037561a749491ea87'; // ここに取得したAPIキーを入力します

    let allResults = [];

    for (const destination of destinations) {
        const url = `https://api.flightapi.io/roundtrip/${apiKey}/${departure}/${destination.IATA}/${departureDate}/${returnDate}/1/0/0/Economy/JPY`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.itineraries) {
                data.itineraries.forEach(itinerary => {
                    // 予算以下のフライトのみ追加
                    if (itinerary.cheapest_price.amount <= budget) {
                        allResults.push({itinerary: itinerary, legs: data.legs, destination: destination});
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
        // price_amountで昇順にソート
        allResults.sort((a, b) => a.itinerary.cheapest_price.amount - b.itinerary.cheapest_price.amount);

        allResults.forEach(result => {
            const itinerary = result.itinerary;
            const legs = result.legs.filter(leg => itinerary.leg_ids.includes(leg.id));
            const destination = result.destination;
            
            const item = document.createElement('div');
            item.className = 'result-item';
            
            legs.forEach(leg => {
                const flightInfo = document.createElement('div');
                flightInfo.className = 'flight-info';
                flightInfo.innerHTML = `
                    <p>出発日時: ${new Date(leg.departure).toLocaleString()}</p>
                    <p>到着地: ${destination.name}</p>
                    <p>搭乗時間: ${leg.duration}分</p>
                `;
                item.appendChild(flightInfo);
            });

            const priceInfo = document.createElement('div');
            priceInfo.className = 'flight-info';
            priceInfo.innerHTML = `
                <p>料金: ${itinerary.cheapest_price.amount}円</p>
            `;
            item.appendChild(priceInfo);

            const bookingLink = document.createElement('a');
            bookingLink.href = `https://www.skyscanner.net${itinerary.pricing_options[0].items[0].url}`;
            bookingLink.textContent = "サイト＞";
            bookingLink.target = "_blank";
            item.appendChild(bookingLink);

            resultsDiv.appendChild(item);
        });

        // 結果が表示された後にスクロールして結果を見えるようにする
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
});
