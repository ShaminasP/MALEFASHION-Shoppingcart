const pieConfig = {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [],
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: ["#0694a2", "#1c64f2", "#7e3af2"],
        label: "Dataset 1",
      },
    ],
    labels: ["Delivered", "Cancelled", "Returned"],
  },
  options: {
    responsive: true,
    cutoutPercentage: 80,
    /**
     * Default legends are ugly and impossible to style.
     * See examples in charts.html to add your own legends
     *  */
    legend: {
      display: false,
    },
  },
};

// change this to the id of your chart element in HMTL

window.addEventListener("load", () => {
  axios.get("/admin/piechart", {}).then((e) => {
    if (e.data) {
      let status = e.data.status;
      pieConfig.data.datasets[0].data = status;
      const pieCtx = document.getElementById("pie");
      window.myPie = new Chart(pieCtx, pieConfig);
    }
  });
});
