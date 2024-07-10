// ver 4.0 txtファイルからの読み込み
// ver 4.1 destinationsをconstからletに変更
// ver 4.2 destinationsを空に。destinationsの中身をチェック。
// ver 4.3 検索結果数を表示
// ver 4.4 pageNumberが謎なので消した。
// ver 4.5 pageNumberがないとダメそうなので戻した。

document.getElementById('budget-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const departure = document.getElementById('departure').value;
    const budget = document.getElementById('budget').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '検索中...';

    let destinations = [{name: '新千歳' ,IATA: 'CTS'}];

    // // departure変数に入っているIATAと同じ名前のtxtファイルを探す
    // const fileName = `${departure}.txt`;
    
    // try {
    //     const response = await fetch(fileName);
    //     if (response.ok) {
    //         const text = await response.text();
    //         destinations = text.split('\n').map(line => {
    //             const [name, IATA] = line.split(',');
    //             return {name: name.trim(), IATA: IATA.trim()};
    //         });
    //     } else {
    //         console.error(`ファイル ${fileName} が見つかりませんでした。`);
    //     }
    // } catch (error) {
    //     console.error(`エラーが発生しました: ${error}`);
    // }

    const apiKey = 'a8a8f369dcmshf76679588667b51p1c1eb5jsnd7fcd1a480e9'; // Replace with your actual API key

    let allResults = {};

    for (const destination of destinations) {
        console.log(destination.name);
        console.log(destination.IATA);

        const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=${departure}&destinationAirportCode=${destination.IATA}&date=${departureDate}&itineraryType=ROUND_TRIP&sortOrder=PRICE&numAdults=1&numSeniors=0&classOfService=ECONOMY&returnDate=${returnDate}&pageNumber=1&nearby=yes&nonstop=yes&currencyCode=JPY`;
        //const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=${departure}&destinationAirportCode=${destination.IATA}&date=${departureDate}&itineraryType=ROUND_TRIP&sortOrder=PRICE&numAdults=1&numSeniors=0&classOfService=ECONOMY&nonstop=yes&currencyCode=JPY`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
                }
            });
            const data = await response.json();
            console.log(data);
            
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

            console.log(destinationIATA);
            console.log(flights.length);

            if (flights.length > 0){
            const destinationTitle = document.createElement('h3');
            destinationTitle.textContent = destination.name;
            destinationBlock.appendChild(destinationTitle);
            }

            const flightsToShow = flights.slice(0, 5);
            flightsToShow.forEach(flight => {
                const item = document.createElement('div');
                item.className = 'result-item';

                const onwardSegment = flight.segments[0].legs[0];
                const returnSegment = flight.segments[1].legs[0];

                const onwardInfo = document.createElement('div');
                onwardInfo.className = 'flight-info';
                onwardInfo.style.display = 'inline-block';
                onwardInfo.style.width = '45%';
                onwardInfo.style.verticalAlign = 'top';
                const onwardDuration = calculateFlightDuration(onwardSegment.departureDateTime, onwardSegment.arrivalDateTime);
                onwardInfo.innerHTML = `
                    <h4>往路</h4>
                    <p>出発: ${new Date(onwardSegment.departureDateTime).toLocaleString()}</p>
                    <p>到着: ${new Date(onwardSegment.arrivalDateTime).toLocaleString()}</p>
                    <p>搭乗時間: ${onwardDuration}</p>
                    <p>航空会社: ${onwardSegment.marketingCarrier.displayName}</p>
                `;
                item.appendChild(onwardInfo);

                const returnInfo = document.createElement('div');
                returnInfo.className = 'flight-info';
                returnInfo.style.display = 'inline-block';
                returnInfo.style.width = '45%';
                returnInfo.style.verticalAlign = 'top';
                const returnDuration = calculateFlightDuration(returnSegment.departureDateTime, returnSegment.arrivalDateTime);
                returnInfo.innerHTML = `
                    <h4>復路</h4>
                    <p>出発: ${new Date(returnSegment.departureDateTime).toLocaleString()}</p>
                    <p>到着: ${new Date(returnSegment.arrivalDateTime).toLocaleString()}</p>
                    <p>搭乗時間: ${returnDuration}</p>
                    <p>航空会社: ${returnSegment.marketingCarrier.displayName}</p>
                `;
                item.appendChild(returnInfo);

                const priceInfo = document.createElement('div');
                priceInfo.className = 'flight-info';
                priceInfo.style.textAlign = 'center';
                priceInfo.style.display = 'inline-block';
                priceInfo.style.width = '70%';
                priceInfo.innerHTML = `
                    <h3>料金: ${flight.purchaseLinks[0].totalPrice} 円</h3>
                `;
                item.appendChild(priceInfo);

                const bookingLink = document.createElement('a');
                bookingLink.href = flight.purchaseLinks[0].url;
                bookingLink.textContent = "サイト＞";
                bookingLink.target = "_blank";
                bookingLink.style.display = 'inline-block';
                bookingLink.style.width = '30%';
                bookingLink.style.float = 'right';
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

                        const onwardSegment = flight.segments[0].legs[0];
                        const returnSegment = flight.segments[1].legs[0];

                        const onwardInfo = document.createElement('div');
                        onwardInfo.className = 'flight-info';
                        onwardInfo.style.display = 'inline-block';
                        onwardInfo.style.width = '45%';
                        onwardInfo.style.verticalAlign = 'top';
                        const onwardDuration = calculateFlightDuration(onwardSegment.departureDateTime, onwardSegment.arrivalDateTime);
                        onwardInfo.innerHTML = `
                            <h4>往路</h4>
                            <p>出発: ${new Date(onwardSegment.departureDateTime).toLocaleString()}</p>
                            <p>到着: ${new Date(onwardSegment.arrivalDateTime).toLocaleString()}</p>
                            <p>搭乗時間: ${onwardDuration}</p>
                            <p>航空会社: ${onwardSegment.marketingCarrier.displayName}</p>
                        `;
                        item.appendChild(onwardInfo);

                        const returnInfo = document.createElement('div');
                        returnInfo.className = 'flight-info';
                        returnInfo.style.display = 'inline-block';
                        returnInfo.style.width = '45%';
                        returnInfo.style.verticalAlign = 'top';
                        const returnDuration = calculateFlightDuration(returnSegment.departureDateTime, returnSegment.arrivalDateTime);
                        returnInfo.innerHTML = `
                            <h4>復路</h4>
                            <p>出発: ${new Date(returnSegment.departureDateTime).toLocaleString()}</p>
                            <p>到着: ${new Date(returnSegment.arrivalDateTime).toLocaleString()}</p>
                            <p>搭乗時間: ${returnDuration}</p>
                            <p>航空会社: ${returnSegment.marketingCarrier.displayName}</p>
                        `;
                        item.appendChild(returnInfo);

                        const priceInfo = document.createElement('div');
                        priceInfo.className = 'flight-info';
                        priceInfo.style.textAlign = 'center';
                        priceInfo.style.display = 'inline-block';
                        priceInfo.style.width = '70%';
                        priceInfo.innerHTML = `
                            <h3>料金: ${flight.purchaseLinks[0].totalPrice} 円</h3>
                        `;
                        item.appendChild(priceInfo);

                        const bookingLink = document.createElement('a');
                        bookingLink.href = flight.purchaseLinks[0].url;
                        bookingLink.textContent = "サイト＞";
                        bookingLink.target = '_blank';
                        bookingLink.style.display = 'inline-block';
                        bookingLink.style.width = '30%';
                        bookingLink.style.float = 'right';
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

    return `${hours}時間${minutes}分`;
}
