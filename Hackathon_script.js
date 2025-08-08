const API_KEY = 'A8UR2M94YFY4VD51'; 
const searchInput = document.getElementById('search_stock');
const trackButton = document.querySelector('.btn');
const welcomeSection = document.querySelector('.Welcome');
const loadingSection = document.querySelector('.Loading');
const stockTrackerSection = document.querySelector('.Stock_tracker');
const errorSection = document.querySelector('.Error');
const popularStocksContainer = document.getElementById('Stock_btns');

// Stock data elements
const stockSymbolElement = document.getElementById('Stock-symbol');
const stockNameElement = document.getElementById('Stock-name');
const currentPriceElement = document.getElementById('current-price');
const priceChangeElement = document.getElementById('priceChange');
const dayLowElement = document.getElementById('daylow');
const dayHighElement = document.getElementById('dayhigh');
const volumeElement = document.getElementById('volume');
const marketCapElement = document.getElementById('marketcap');
const previousCloseElement = document.getElementById('previousClose');
const openElement = document.getElementById('open');
const fiftyTwoWeekHighElement = document.getElementById('fiftyTwoWeekHigh');
const fiftyTwoWeekLowElement = document.getElementById('fiftyTwoWeekLow');
const lastTradeTimeElement = document.getElementById('last-trade-time');
const lastUpdateElement = document.getElementById('last-update');
const errorMessageElement = document.getElementById('error-message');

// Chart elements
const timeRangeSelect = document.getElementById('timerange');
const priceChartCanvas = document.getElementById('priceChart');
let priceChart = null;

// Popular stocks
const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
];

function init() {
    console.log('Initializing Stock Tracker App...');
    
    const requiredElements = [
        { name: 'searchInput', element: searchInput },
        { name: 'trackButton', element: trackButton },
        { name: 'welcomeSection', element: welcomeSection },
        { name: 'loadingSection', element: loadingSection },
        { name: 'stockTrackerSection', element: stockTrackerSection },
        { name: 'errorSection', element: errorSection },
        { name: 'popularStocksContainer', element: popularStocksContainer }
    ];
    
    requiredElements.forEach(({ name, element }) => {
        if (!element) {
            console.error(`Required element not found: ${name}`);
        }
    });
    
    updateDateTime();
    createPopularStockButtons();
    
    if (trackButton) trackButton.addEventListener('click', trackStock);
    if (searchInput) searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && trackStock());
    if (timeRangeSelect) timeRangeSelect.addEventListener('change', updateChartTimeRange);
    
    showSection('welcome');
    console.log('App initialization completed');
}

function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    if (lastUpdateElement) lastUpdateElement.textContent = formattedDate;
}

function createPopularStockButtons() {
    if (!popularStocksContainer) return;
    
    popularStocks.forEach(stock => {
        const button = document.createElement('button');
        button.className = 'stock-btn';
        button.textContent = stock.symbol;
        button.addEventListener('click', () => {
            searchInput.value = stock.symbol;
            trackStock();
        });
        popularStocksContainer.appendChild(button);
    });
}

function showSection(section) {
    const sections = [welcomeSection, loadingSection, stockTrackerSection, errorSection];
    sections.forEach(sec => sec && (sec.style.display = 'none'));

    switch(section) {
        case 'welcome': welcomeSection && (welcomeSection.style.display = 'flex'); break;
        case 'loading': loadingSection && (loadingSection.style.display = 'flex'); break;
        case 'stock': stockTrackerSection && (stockTrackerSection.style.display = 'block'); break;
        case 'error': errorSection && (errorSection.style.display = 'flex'); break;
    }
}

async function trackStock() {
    const symbol = searchInput.value.trim().toUpperCase();

    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    console.log('Tracking stock:', symbol);
    showSection('loading');

    try {
        const [quoteData, historicalData] = await Promise.all([
            fetchStockQuote(symbol),
            fetchHistoricalData(symbol)
        ]);

        if (quoteData.error || !quoteData['Global Quote']) {
            showError(quoteData.error || 'No data available for this symbol');
            return;
        }

        const stockData = processStockData(quoteData, historicalData, symbol);
        updateStockUI(stockData);
        showSection('stock');

        if (stockData.historicalData) {
            initializeChart(stockData.historicalData);
        } else {
            console.warn('No historical data available for chart');
        }

    } catch (error) {
        console.error('Error tracking stock:', error);
        showError(error.message || 'Failed to fetch stock data');
    }
}

async function fetchStockQuote(symbol) {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    return await response.json();
}

async function fetchHistoricalData(symbol) {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`);
    return await response.json();
}

function processStockData(quoteData, historicalData, symbol) {
    const quote = quoteData['Global Quote'];
    const popularStock = popularStocks.find(stock => stock.symbol === symbol);
    
    // Process current quote data
    const stockData = {
        symbol,
        name: popularStock ? popularStock.name : `${symbol} Company`,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        percentChange: parseFloat(quote['10. change percent'].replace('%', '')),
        dayLow: parseFloat(quote['04. low']),
        dayHigh: parseFloat(quote['03. high']),
        volume: parseInt(quote['06. volume']).toLocaleString(),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        lastTradeTime: new Date().toLocaleTimeString()
    };

    // Process historical data if available
    if (historicalData['Time Series (Daily)']) {
        const timeSeries = historicalData['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).sort();
        
        stockData.historicalData = dates.map(date => ({
            date,
            price: parseFloat(timeSeries[date]['4. close'])
        })).slice(-30); 
    }

    return stockData;
}

function updateStockUI(data) {
    if (!data) {
        console.error('No data provided to updateStockUI');
        return;
    }

    // Update basic info
    if (stockSymbolElement) stockSymbolElement.textContent = data.symbol || '--';
    if (stockNameElement) stockNameElement.textContent = data.name || '--';
    if (currentPriceElement) currentPriceElement.textContent = `$${data.price?.toFixed(2) || '0.00'}`;

    // Update price change
    const isPositive = (data.change || 0) >= 0;
    const arrowPoints = isPositive ? "18,15 12,9 6,15" : "6,10 12,16 18,10";

    if (priceChangeElement) {
        priceChangeElement.innerHTML = `
            <svg class="change-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${arrowPoints}"></polyline>
            </svg>
            <span style="font-family: Calibri;">${isPositive ? '+' : ''}${data.change?.toFixed(2) || '0.00'} (${isPositive ? '+' : ''}${data.percentChange?.toFixed(2) || '0.00'}%)</span>
        `;
        priceChangeElement.className = isPositive ? 'price-change positive' : 'price-change negative';
    }

    // Update other fields
    if (dayLowElement) dayLowElement.textContent = `$${data.dayLow?.toFixed(2) || '0.00'}`;
    if (dayHighElement) dayHighElement.textContent = `$${data.dayHigh?.toFixed(2) || '0.00'}`;
    if (volumeElement) volumeElement.textContent = data.volume || '0';
    if (previousCloseElement) previousCloseElement.textContent = `$${data.previousClose?.toFixed(2) || '0.00'}`;
    if (openElement) openElement.textContent = `$${data.open?.toFixed(2) || '0.00'}`;
    if (lastTradeTimeElement) lastTradeTimeElement.textContent = data.lastTradeTime || '--';

    // For 52-week high/low, we'll use the historical data if available
    if (data.historicalData) {
        const prices = data.historicalData.map(d => d.price);
        const fiftyTwoWeekHigh = Math.max(...prices);
        const fiftyTwoWeekLow = Math.min(...prices);
        
        if (fiftyTwoWeekHighElement) fiftyTwoWeekHighElement.textContent = `$${fiftyTwoWeekHigh.toFixed(2)}`;
        if (fiftyTwoWeekLowElement) fiftyTwoWeekLowElement.textContent = `$${fiftyTwoWeekLow.toFixed(2)}`;
    }

    updateDateTime();
}

function showError(message) {
    if (errorMessageElement) errorMessageElement.textContent = message;
    showSection('error');
}

function initializeChart(historicalData) {
    if (!priceChartCanvas || !historicalData?.length || typeof Chart === 'undefined') {
        console.error('Chart initialization failed - missing requirements');
        return;
    }

    const ctx = priceChartCanvas.getContext('2d');
    if (priceChart) priceChart.destroy();

    const labels = historicalData.map(data => data.date);
    const prices = historicalData.map(data => data.price);
    const lineColor = prices[0] <= prices[prices.length - 1] ? '#059669' : '#dc2626';

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Stock Price',
                data: prices,
                borderColor: lineColor,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: false }
            }
        }
    });
}

function updateChartTimeRange() {
    const range = timeRangeSelect.value;
    console.log(`Time range changed to: ${timeRangeSelect.options[range-1].text}`);
    // In a real implementation, we would fetch new data based on the selected range
}

document.addEventListener('DOMContentLoaded', init);