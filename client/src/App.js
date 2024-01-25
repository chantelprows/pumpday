import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import dateFormat from "dateformat";
import './App.css';

function App() {

  const [data, setData] = useState(null);
  const [operatingLoad, setOperatingLoad] = useState(null);

  const getState = (value, time) => {
    // determine state based on operating load
    let state = "Off";
    const percent = value / operatingLoad;
    if (value <= 0.1) {
      state = "On - Very Minimal Power";
    } else if (percent < .20) {
      state = "On - idle";
    } else {
      state = "On - loaded";
    }

    // generate label for state
    return `${dateFormat(new Date(time), "M/dd/yy h:MM TT")}\nState: ${state}`;
  }

  const formatData = (data) => {
    calcOperatingLoad(data);
    // store first array data as labels
    const formattedData = [["Time", "Average Psum", { role: "tooltip", type: "string", p: { html: true }} ]];
    for (const item of data) {
      formattedData.push([new Date(item.from), item.metrics.Psum.avgvalue, getState(item.metrics.Psum.avgvalue, item.from)]);
    }
    setData(formattedData);
  }

  const calcOperatingLoad = (data) => {
    // the average of the top 10 values in the previous day
    const copyData = [ ...data ].map(x => x.metrics.Psum.avgvalue);
    copyData.sort(function(a, b) { 
      return b - a;
    });
    const topTen = copyData.slice(0, 10);
    const average = topTen.reduce((a, b) => a + b) / 10;
    setOperatingLoad(average);
  }

  useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((data) => formatData(data.data));
  });

  const options = {
    title: "Operating Load (hover to see machine state)",
    theme: 'material',
    curveType: "function",
    hAxis: {
      format: "M/dd/yy\nh:MMa",
      textStyle: {
        fontSize: 12,
      },
    },
    vAxis: {
      textStyle: {
        fontSize: 12,
      },
      viewWindow: {
        min: -50,
        max: 450
      },
    },
    legend: "none",
  };

  return (
    <>
      { data && operatingLoad ? (
        <Chart
          chartType="LineChart"
          width="100%"
          height="700px"
          data={data}
          options={options}
        />
        ) : (
          <div className="spinner-container">
            <div className="loading-spinner"></div>
          </div>
        )
      }
    </>
  );
};

export default App;
