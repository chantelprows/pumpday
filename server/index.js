const express = require("express");
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/data", (req, res) => {
  const data = []
  fs.createReadStream(path.resolve(__dirname, 'demoPumpDayData.csv'))
    .pipe(parse())
    .on('data', (row) => {
      // skip headers
      if (row[0] != 'deviceid') {
        data.push({
          id: row[0],
          from: new Date(parseInt(row[1])),
          to: new Date(parseInt(row[2])),
          metrics: JSON.parse(row[3]),
        });
      }
    })
    .on('error', () => res.status(500).send(new Error('error getting data')))
    .on('end', () => {
      // sort data by date
      data.sort(function(a, b) { 
        return a.from - b.from;
      });
      res.json({ data: data });
    });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});