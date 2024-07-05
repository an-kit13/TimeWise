document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["websiteData"], (result) => {
    const websiteData = result.websiteData || {};
    displayChart(websiteData);
    displayWebsiteData(websiteData);
  });
});

function displayChart(websiteData) {
  const totalScreenTime = Object.values(websiteData).reduce((acc, data) => acc + data.time, 0);
  const categorizedData = {
    Productive: 0,
    Entertainment: 0,
    Utilities: 0,
    Others: 0
  };

  for (const hostname in websiteData) {
    categorizedData[websiteData[hostname].category] += websiteData[hostname].time;
  }

  const chartData = {
    labels: Object.keys(categorizedData),
    datasets: [{
      label: 'Screen Time (seconds)',
      data: Object.values(categorizedData),
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#9e9e9e'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              label += context.raw.toFixed(2) + ' seconds (' + ((context.raw / totalScreenTime) * 100).toFixed(2) + '%)';
              return label;
            }
          }
        },
        datalabels: {
          color: '#fff',
          formatter: (value, ctx) => {
            let sum = ctx.chart._metasets[0].total;
            let percentage = (value * 100 / sum).toFixed(2) + "%";
            return percentage;
          },
          font: {
            weight: 'bold',
            size: 16
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function displayWebsiteData(websiteData) {
  const websiteList = document.getElementById('website-list');
  const sortedData = Object.entries(websiteData).sort((a, b) => b[1].time - a[1].time);

  sortedData.forEach(([hostname, data]) => {
    const listItem = document.createElement('li');
    listItem.className = 'website-item';
    listItem.innerHTML = `<strong>${hostname}</strong>: ${data.time.toFixed(2)} seconds (${data.category})`;
    websiteList.appendChild(listItem);
  });
}
