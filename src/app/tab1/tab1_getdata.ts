import { Database } from '../../data_processing/database';

var db = Database();

function getHotFlashData(callback) {
  var end = new Date(Date.now());
  var begin = end;
  begin.setHours(begin.getHours()-12);

  var histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var labels = [];
  var currentTime = begin;
  for (var i=0; i<histogram.length; i++) {
    labels.push(currentTime.getHours() + ":" + currentTime.getMinutes());
    currentTime.setHours(currentTime.getHours()+2);
  }

  db.getRangeData(begin, end, (docs) => {
    console.log(docs);

    for (var i=0; i<docs.length; i++) {
      if (docs[i].type==0) {
        histogram[docs[i].ts.getHours()-begin.getHours()] += 1;
      }
    }

    callback(labels, histogram);
  })
}

function getSleepData(callback) {
  var end = new Date(Date.now());
  var begin = end;
  begin.setDate(end.getDate()-14);

  db.getSleep((docs) => {
    var sleeps = [];
    for (var i=0; i<docs.length; i++) {
      if (docs[i].ts >= begin && docs[i].ts <= end)
        sleeps.push(docs[i]);
    }

    callback(sleeps);
  })
}