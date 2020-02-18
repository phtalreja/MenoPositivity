import { Component, OnInit, ViewChild } from '@angular/core';

import { Chart } from 'chart.js';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {

  hotflashchart: any;
  sleepdatachart: any;
  toptriggers: any;

  constructor() {}

  ngOnInit() {
    const dataPoints = [{
      x: 1,
      y: 10
    }, {
      x: 2,
      y: 20
    },
    {
      x: 3,
      y: 0
    }];
    const labels = ['a','b', 'c'];

    getHotFlashData(((labels, dataPoints) => {
      this.hotflashchart = new Chart('hotflashes', {
        type: 'bar',
        data: {
          labels: labels, // your labels array
          datasets: [
            {
              data: dataPoints, // your data array
              borderColor: '#00AEFF',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true
            }],
          }
        }
      });
    }).bind(this))

    getTopTriggers((triggers => this.toptriggers = triggers.join('\n')).bind(this))

    getSleepData(((labels, dataPoints) => {
      this.sleepdatachart = new Chart('sleepdata', {
        type: 'line',
        data: {
          labels: labels, // your labels array
          datasets: [
            {
              data: dataPoints, // your data array
              borderColor: '#00AEFF',
              fill: false
            }
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true
            }],
          }
        }
      });
    }).bind(this))
  }

}

import { Database } from '../../data_processing/database';

function getHotFlashData(callback) {
  var db = new Database();
  var end = new Date(Date.now());
  var begin = end;
  begin.setDate(begin.getDate()-14);

  var histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var labels = [];
  var currentTime = begin;
  for (var i=0; i<histogram.length; i++) {
    labels.push((currentTime.getMonth()+1).toString() + "/" + currentTime.getDate());
    currentTime.setDate(currentTime.getDate()+1);
  }

  db.getRangeData(begin, end, (docs) => {
    for (var i=0; i<docs.length; i++) {
      if (docs[i].type==0) {
        histogram[docs[i].ts.getDate()-begin.getDate()] += 1;
      }
    }

    callback(labels, histogram);
  })
}

function getTopTriggers(callback) {
  var events = [/* Symptoms*/"Hot flash","Insomnia","Dizziness","Joint pain","Anxiety","Depression",/*Triggers*/"Stress","Mood","Caffeine","Smoking","Warm environment","Alcohol","Sugar","Spicy food","Tight clothing","Dehydration","Bending over"];

  var db = new Database();
  db.getAggregate((docs) => {
    console.log(docs);

    if (docs.length<1) {
      callback(["No data"]);
      return;
    }

    var averages = [];
    for (var property in docs[0]) {
      averages.push([events[property], docs[0][1]/docs[0][0]]);
    }

    averages.sort((a, b) => b[1]-a[1]);

    
    callback(averages.slice(0, 3).map(a => a[0]));
  })
}

function getSleepData(callback) {
  var db = new Database();
  var end = new Date(Date.now());
  var begin = end;
  begin.setDate(begin.getDate()-14);

  db.getSleep((docs) => {
    console.log(docs);

    var data = []

    for (var i=0; i<docs.length; i++) {
      if (docs[i].ts>=begin && docs[i].ts<=end) {
        data.push([docs[i].ts, docs[i].hoursSlept])
      }
    }

    data.sort((a, b) => a[0]-b[0]);

    var labels = []
    var sleeps = []
    for (var i=0; i<data.length; i++) {
      labels.push(data[i][0]);
      sleeps.push(data[i][1]);
    }

    callback(labels, sleeps);
  })
}