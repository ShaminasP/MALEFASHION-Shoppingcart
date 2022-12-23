/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "",
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: "#0694a2",
        borderColor: "#0694a2",
        data: [43, 48, 40, 54, 67, 73, 70],
        fill: false,
      },
      {
        label: "",
        fill: false,
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: "#7e3af2",
        borderColor: "#7e3af2",
        data: [24, 50, 64, 74, 52, 51, 65],
      },
    ],
  },
  options: {
    responsive: true,
    /**
     * Default legends are ugly and impossible to style.
     * See examples in charts.html to add your own legends
     *  */
    legend: {
      display: false,
    },
    tooltips: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Month",
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Value",
        },
      },
    },
  },
};
function getLine() {
  const a = document.getElementById("select").value;
  chartsF(a);
}
chartsF(7);
function chartsF(a) {
  axios.get("/admin/chart", { params: { a: a } }).then((e) => {
    if (a == 7) {
      lineConfig.data.labels = [
        "Day1",
        "Day2",
        "Day3",
        "Day4",
        "Day5",
        "Day6",
        "Day7",
      ];
      lineConfig.data.datasets[0].label = "Current Week";
      lineConfig.data.datasets[1].label = "Last Week";
    } else if (a == 365) {
      lineConfig.data.labels = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      lineConfig.data.datasets[0].label = "Current Year";
      lineConfig.data.datasets[1].label = "Last Year";
    } else if (a == 30) {
      lineConfig.data.labels = [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
      ];
      lineConfig.data.datasets[0].label = "Current Month";
      lineConfig.data.datasets[1].label = "Last Month";
    }

    if (e.data) {
      const sales = e.data.sales;
      const total = sales.map((s) => {
        return s.totalPrice;
      });
      console.log("total");
      console.log(total);
      const previous = e.data.PreviosSale;
      console.log(previous);
      const previoustotal = previous.map((x) => x.totalPrice);
      console.log("total");
      console.log(previoustotal);
      lineConfig.data.datasets[0].data = total;
      lineConfig.data.datasets[1].data = previoustotal;
      document.getElementById(
        "charts"
      ).innerHTML = `<canvas id="line"></canvas>`;
      // change this to the id of your chart element in HMTL
      const lineCtx = document.getElementById("line");
      window.myLine = new Chart(lineCtx, lineConfig);
    }
  });
}
