
var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
var yValues = [55, 49, 44, 24, 15];
var barColors = [
  "#C292C0",
  "#00aba9",
  "#3974AD",
  "#e8c3b9",
  "#B2D6D1"
];
//yuvarlak grafik
new Chart("myChart", {
  type: "doughnut",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    plugins: {
        title: {
            display: true,
            text: "Veriler",
            font: {
              size: 18, // Başlık font büyüklüğü
              weight: "bold"
            },
            color: "#333", // Başlık rengi
              padding: {
                top: 10,
                bottom: 10
              }
          }
    }
  }
});
//grafik
const ctx = document.getElementById('incomeChart').getContext('2d');
        
new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: '2021',
                        backgroundColor: 'rgba(128, 128, 255, 0.7)',
                        borderColor: 'rgba(128, 128, 255, 1)',
                        borderWidth: 1,
                        data: [12, 5, 10, 25, 15, 10, 8]
                    },
                    {
                        label: '2020',
                        backgroundColor: 'rgba(0, 191, 255, 0.7)',
                        borderColor: 'rgba(0, 191, 255, 1)',
                        borderWidth: 1,
                        data: [-10, -12, -5, -8, -3, -12, -10]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
});
//kar-gelir-gider tablosu
const ctxx = document.getElementById('incomeChartt').getContext('2d');
        let chart;

        const dataSets = {
            income: {
                label: 'Gelir',
                data: [10, 20, 15, 30, 25, 28, 22],
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)'
            },
            expenses: {
                label: 'Giderler',
                data: [8, 18, 12, 25, 20, 22, 19],
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)'
            },
            profit: {
                label: 'Kâr',
                data: [2, 2, 3, 5, 5, 6, 3],
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.1)'
            }
        };

        function createChart(type) {
            chart = new Chart(ctxx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                        label: dataSets[type].label,
                        borderColor: dataSets[type].borderColor,
                        backgroundColor: dataSets[type].backgroundColor,
                        data: dataSets[type].data,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function updateChart(type) {
            if (chart) {
                chart.destroy();
            }
            createChart(type);
            document.getElementById("balanceText").innerHTML = type === 'income' ? "$459.10 <span class='small-text'>⬆ %42,9</span>" :
                type === 'expenses' ? "$200.50 <span class='small-text'>⬇ %15,4</span>" :
                "$258.60 <span class='small-text'>⬆ %27,5</span>";
        }

        createChart('income');


// projeEkle