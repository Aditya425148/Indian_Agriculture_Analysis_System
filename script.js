// Wait until page loads
document.addEventListener("DOMContentLoaded", function () {

  // TOP STATES BAR CHART
  fetch("http://localhost:5000/api/top-states")
    .then(res => res.json())
    .then(data => {

      if (!data.length) {
        console.log("No data received for top states");
        return;
      }

      const labels = data.map(d => d.state_name);
      const values = data.map(d => Number(d.total_production));

      const ctx = document.getElementById("barChart");

      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Production (Tonnes)",
              data: values,
              backgroundColor: "#2e7d32"
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

    })
    .catch(err => console.log("Bar chart error:", err));


  // YEAR TREND LINE CHART
  fetch("http://localhost:5000/api/year-trend")
    .then(res => res.json())
    .then(data => {

      if (!data.length) {
        console.log("No data received for year trend");
        return;
      }

      const labels = data.map(d => d.year);
      const values = data.map(d => Number(d.total_production));

      const ctx2 = document.getElementById("lineChart");

      if (ctx2) {
        new Chart(ctx2, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Yearly Production",
              data: values,
              borderColor: "#1976d2",
              borderWidth: 3,
              fill: false,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

    })
    .catch(err => console.log("Line chart error:", err));

});