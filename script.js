let stockSymbol = "AAPL";
const API_KEY = "92W9BPX0JFJKEYZD"; 

const ctx = document.getElementById('stockChart').getContext('2d');
const stockChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: `${stockSymbol} Stock Price ($)`,
      data: [],
      borderColor: '#007bff',
      backgroundColor: 'rgba(0,123,255,0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#007bff'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { font: { size: 16 } } }
    },
    scales: {
      x: { title: { display: true, text: "Time", font: { size: 16 } } },
      y: { title: { display: true, text: "Price ($)", font: { size: 16 } } }
    }
  }
});

function setStock() {
  const input = document.getElementById("stockInput").value.trim();
  if (input) {
    stockSymbol = input.toUpperCase();
    stockChart.data.labels = [];
    stockChart.data.datasets[0].data = [];
    stockChart.data.datasets[0].label = `${stockSymbol} Stock Price ($)`;
    document.getElementById("companyName").textContent = `Tracking: ${stockSymbol}`;
    stockChart.update();
    closeSearch();
    updateChart();
  }
}

async function fetchStockPrice() {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${API_KEY}`);
    const data = await response.json();
    document.getElementById("currentPrice").textContent = `$${data.c}`;
    document.getElementById("highPrice").textContent = `$${data.h}`;
    document.getElementById("lowPrice").textContent = `$${data.l}`;
    document.getElementById("openPrice").textContent = `$${data.o}`;
    return data.c;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

async function updateChart() {
  const price = await fetchStockPrice();
  if (price) {
    const now = new Date().toLocaleTimeString();
    stockChart.data.labels.push(now);
    stockChart.data.datasets[0].data.push(price);

    if (stockChart.data.labels.length > 15) {
      stockChart.data.labels.shift();
      stockChart.data.datasets[0].data.shift();
    }
    stockChart.update();
  }
}

setInterval(updateChart, 5000);
updateChart();


function openSearch() {
  document.getElementById("searchModal").style.display = "flex";
}
function closeSearch() {
  document.getElementById("searchModal").style.display = "none";
}










