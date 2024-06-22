document.getElementById('budget-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const budget = document.getElementById('budget').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '検索中...';

    //const apiKey = 'YOUR_API_KEY'; // ここに取得したAPIキーを入力します
    const url = `curl "https://api.flightapi.io/onewaytrip/66741cc03b71ee8dea107175/HEL/OUL/2024-05-20/1/0/0/Economy/USD"`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);
        
        resultsDiv.innerHTML = '';
        
        if (data.flights && data.flights.length === 0) {
            resultsDiv.innerHTML = '該当する目的地が見つかりませんでした。';
        } else {
            data.flights.forEach(flight => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.textContent = `目的地: ${flight.destination}, 価格: ${flight.price}円`;
                resultsDiv.appendChild(item);
            });
        }
    } catch (error) {
        resultsDiv.innerHTML = '検索中にエラーが発生しました。もう一度お試しください。';
        console.error('Error:', error);
    }
});
