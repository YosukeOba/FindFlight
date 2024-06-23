document.getElementById('budget-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const budget = document.getElementById('budget').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '検索中...';

    const apiKey = '6676fb181ebc408dca72b96c'; // ここに取得したAPIキーを入力します
    const url = `https://api.flightapi.io/roundtrip/${apiKey}/${departure}/LAX/${departureDate}/${returnDate}/1/0/0/Economy/JPY`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);
        
        resultsDiv.innerHTML = '';

        if (data.itineraries && data.itineraries.length === 0) {
            resultsDiv.innerHTML = '該当する目的地が見つかりませんでした。';
        } else {
            data.itineraries.forEach(itinerary => {
                const item = document.createElement('div');
                item.className = 'result-item';
                
                const legIds = itinerary.leg_ids;
                const legs = data.legs.filter(leg => legIds.includes(leg.id));
                
                legs.forEach(leg => {
                    const flightInfo = document.createElement('div');
                    flightInfo.className = 'flight-info';
                    flightInfo.innerHTML = `
                        <p>出発日時: ${new Date(leg.departure).toLocaleString()}</p>
                        <p>出発地: ${leg.origin_place_id}</p>
                        <p>到着地: ${leg.destination_place_id}</p>
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

                resultsDiv.appendChild(item);
            });
        }
    } catch (error) {
        resultsDiv.innerHTML = '検索中にエラーが発生しました。もう一度お試しください。';
        console.error('Error:', error);
    }
});
