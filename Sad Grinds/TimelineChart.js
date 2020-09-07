import React from "react";
import ReactDOM from "react-dom";
import Chart from "chart.js";
// context api
// import { BuilderContext } from "./BuilderContext";

var myChart;

function addData(chart, data, labels) {
  if (data) {
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = Array(data.length).fill(
      "rgba(75, 192, 192, 0.2)"
    );
    chart.data.datasets[0].borderColor = Array(data.length).fill(
      "rgba(75, 192, 192, 1)"
    );
  }
  if (labels) {
    chart.data.labels = labels;
  }
  chart.update();
}

export default class TimelineChart extends React.Component {
  state = { chartData: [], labels: [] };

  componentDidMount() {
    var wrapper = ReactDOM.findDOMNode(this);
    var ctx = wrapper.firstChild;
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ["rgba(75, 192, 192, 0.2)"],
            borderColor: ["rgba(75, 192, 192, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stepSize: 1,
                suggestedMax: 5,
                suggestedMin: 0,
              },
              scaleLabel: {
                display: true,
                labelString: "# of Activities",
              },
            },
          ],
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Travel Dates",
              },
            },
          ],
        },
        responsive: false,
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            // Prevent items with undefined labels from appearing in the legend
            filter: (item) => item.text !== undefined,
          },
        },
        tooltips: {
          // Prevent items with undefined labels from showing tooltips
          filter: (item, chart) => chart.labels[item.index] !== undefined,
        },
      },
    });
    myChart.canvas.setAttribute("class", "timelineChartComponent");
    var days = this.context.data.columnOrder.length - 1;
    var finalDays = [];
    var finalData = [];
    for (var eachDay = 0; eachDay < days; eachDay++) {
      finalDays.push(`Day${eachDay + 1}`);
      finalData.push(0);
    }
    addData(myChart, finalData, finalDays);
  }

  componentDidUpdate() {
    // udpate number of days
    var days = this.context.data.columnOrder.length - 1;
    var finalDays = [];
    for (var eachDay = 0; eachDay < days; eachDay++) {
      finalDays.push(
        this.context.data.columns[`column-${eachDay + 2}`].title.slice(4)
      );
    }
    var finalData = [];
    for (eachDay = 1; eachDay <= days; eachDay++) {
      var dataNo = this.context.data.columns[
        this.context.data.columnOrder[eachDay]
      ].taskIds.length;
      finalData.push(dataNo);
    }

    addData(myChart, finalData, finalDays);
  }
  render() {
    return (
      <div className="timelineChartWrapper">
        <canvas id="timelineChartComponent" width="500" height="240">
          <p>Your browser does not support the canvas element.</p>
        </canvas>
      </div>
    );
  }
}
TimelineChart.contextType = BuilderContext;
