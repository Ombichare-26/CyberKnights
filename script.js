// DOM Elements
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

// Initialize the app
function init() {
    console.log('Initializing Stock Tracker App...');
    
    // Check if all required elements exist
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
    
    // Set current date
    updateDateTime();
    
    // Create popular stock buttons
    createPopularStockButtons();
    
    // Set up event listeners
    if (trackButton) {
        trackButton.addEventListener('click', trackStock);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackStock();
            }
        });
    }
    
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', updateChartTimeRange);
    }
    
    // Show welcome section by default
    showSection('welcome');
    
    console.log('App initialization completed');
}

// Update date and time
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
    if (lastUpdateElement) {
        lastUpdateElement.textContent = formattedDate;
    }
}

// Create popular stock buttons
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

// Show a specific section and hide others
function showSection(section) {
    const sections = [welcomeSection, loadingSection, stockTrackerSection, errorSection];
    
    sections.forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    switch(section) {
        case 'welcome':
            if (welcomeSection) welcomeSection.style.display = 'flex';
            break;
        case 'loading':
            if (loadingSection) loadingSection.style.display = 'flex';
            break;
        case 'stock':
            if (stockTrackerSection) stockTrackerSection.style.display = 'block';
            break;
        case 'error':
            if (errorSection) errorSection.style.display = 'flex';
            break;
    }
}

// Track stock function
async function trackStock() {
    const symbol = searchInput.value.trim().toUpperCase();

    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    console.log('Tracking stock:', symbol);
    showSection('loading');

    try {
        // Fetch stock data (using mock data for this example)
        const stockData = await fetchStockData(symbol);

        console.log('Received stock data:', stockData);

        if (stockData && stockData.error) {
            showError(stockData.error);
            return;
        }

        if (!stockData) {
            showError('Failed to fetch stock data');
            return;
        }

        // Update UI with stock data
        updateStockUI(stockData);

        // Show stock section
        showSection('stock');

        // Initialize chart
        if (stockData.historicalData && stockData.historicalData.length > 0) {
            initializeChart(stockData.historicalData);
        } else {
            console.warn('No historical data available for chart');
        }

    } catch (error) {
        console.error('Error tracking stock:', error);
        showError(error.message);
    }
}

// Mock API function to fetch stock data
async function fetchStockData(symbol) {
    // In a real app, you would fetch from a real API like Alpha Vantage, Yahoo Finance, etc.
    // This is a mock implementation for demonstration

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if symbol is in our popular stocks or allow any symbol
    const popularStock = popularStocks.find(stock => stock.symbol === symbol);

    // Allow all symbols to work for demo purposes
    // Comment out the error condition to let all symbols work
    // if (!popularStock && symbol !== 'MOCK') {
    //     return { 
    //         error: `No data available for symbol: ${symbol}` 
    //     };
    // }

    // Generate mock data
    const basePrice = Math.random() * 100 + 50;
    const priceChange = (Math.random() - 0.5) * 10;
    const percentChange = (priceChange / basePrice) * 100;
    const dayLow = basePrice - Math.random() * 5;
    const dayHigh = basePrice + Math.random() * 5;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    const marketCap = Math.floor(Math.random() * 1000000000000) + 1000000000;

    // Generate historical data for chart
    const historicalData = [];
    const now = new Date();
    const days = 30; // 1 month of data

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Simulate price movement
        const price = basePrice + (Math.random() - 0.5) * 10;

        historicalData.push({
            date: date.toLocaleDateString(),
            price: parseFloat(price.toFixed(2))
        });
    }

    const stockData = {
        symbol,
        name: popularStock ? popularStock.name : `${symbol} Company Inc.`,
        price: parseFloat((basePrice + priceChange).toFixed(2)),
        change: parseFloat(priceChange.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2)),
        dayLow: parseFloat(dayLow.toFixed(2)),
        dayHigh: parseFloat(dayHigh.toFixed(2)),
        volume: volume.toLocaleString(),
        marketCap: marketCap.toLocaleString(),
        previousClose: parseFloat(basePrice.toFixed(2)),
        open: parseFloat((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
        fiftyTwoWeekHigh: parseFloat((basePrice + Math.random() * 20).toFixed(2)),
        fiftyTwoWeekLow: parseFloat((basePrice - Math.random() * 20).toFixed(2)),
        lastTradeTime: new Date().toLocaleTimeString(),
        historicalData
    };

    console.log('Generated stock data:', stockData);
    return stockData;
}

// Update stock UI with data
function updateStockUI(data) {
    console.log('Updating UI with data:', data);

    if (!data) {
        console.error('No data provided to updateStockUI');
        return;
    }

    // Safely update elements with null checks
    if (stockSymbolElement) stockSymbolElement.textContent = data.symbol || '--';
    if (stockNameElement) stockNameElement.textContent = data.name || '--';
    if (currentPriceElement) currentPriceElement.textContent = `$${data.price || '0.00'}`;

    // Update price change
    const isPositive = (data.change || 0) >= 0;
    const arrowPoints = isPositive ? "18,15 12,9 6,15" : "6,10 12,16 18,10";

    if (priceChangeElement) {
        priceChangeElement.innerHTML = `
            <svg class="change-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${arrowPoints}"></polyline>
            </svg>
            <span style="font-family: Calibri;">${isPositive ? '+' : ''}${data.change || '0.00'} (${isPositive ? '+' : ''}${data.percentChange || '0.00'}%)</span>
        `;
        priceChangeElement.className = isPositive ? 'price-change positive' : 'price-change negative';
    }

    // Update other fields with null checks
    if (dayLowElement) dayLowElement.textContent = `$${data.dayLow || '0.00'}`;
    if (dayHighElement) dayHighElement.textContent = `$${data.dayHigh || '0.00'}`;
    if (volumeElement) volumeElement.textContent = data.volume || '0';
    if (marketCapElement) marketCapElement.textContent = `$${data.marketCap || 'N/A'}`;
    if (previousCloseElement) previousCloseElement.textContent = `$${data.previousClose || '0.00'}`;
    if (openElement) openElement.textContent = `$${data.open || '0.00'}`;
    if (fiftyTwoWeekHighElement) fiftyTwoWeekHighElement.textContent = `$${data.fiftyTwoWeekHigh || '0.00'}`;
    if (fiftyTwoWeekLowElement) fiftyTwoWeekLowElement.textContent = `$${data.fiftyTwoWeekLow || '0.00'}`;
    if (lastTradeTimeElement) lastTradeTimeElement.textContent = data.lastTradeTime || '--';

    // Update last updated time
    updateDateTime();

    console.log('UI update completed');
}

// Show error message
function showError(message) {
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
    }
    showSection('error');
}

// Initialize chart
function initializeChart(historicalData) {
    console.log('Initializing chart with data:', historicalData);

    if (!priceChartCanvas) {
        console.error('Chart canvas not found');
        return;
    }

    if (!historicalData || historicalData.length === 0) {
        console.error('No historical data provided for chart');
        return;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    const ctx = priceChartCanvas.getContext('2d');

    // Destroy previous chart if it exists
    if (priceChart) {
        priceChart.destroy();
        priceChart = null;
    }

    // Prepare chart data
    const labels = historicalData.map(data => data.date);
    const prices = historicalData.map(data => data.price);

    console.log('Chart labels:', labels);
    console.log('Chart prices:', prices);

    // Determine line color based on price trend
    const lineColor = prices[0] <= prices[prices.length - 1] ? '#059669' : '#dc2626';

    try {
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
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
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        console.log('Chart created successfully');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// Update chart time range
function updateChartTimeRange() {
    // In a real app, this would fetch new data based on the selected range
    // For this demo, we'll just log the selection
    const range = timeRangeSelect.value;
    console.log(`Time range changed to: ${timeRangeSelect.options[range-1].text}`);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
