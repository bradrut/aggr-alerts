/**
 * This is a copy of the script that is to be used in the AGGR built-in script box for integration with
 * the aggr-telegram-service running locally. lbuyThreshold and lsellThreshold can be changed as desired.
 */

let lbuyThreshold=1800000;
let lsellThreshold=-1800000;

plothistogram(lbuy, color=options.upColor)
plothistogram(-lsell, color=options.downColor)
plotline(lbuyThreshold);
plotline(lsellThreshold);

if ((lbuy !== 0)) {
  fetch('http://localhost:3001/liquidationAlerts', {
    method: "POST",
    body: JSON.stringify({"buyThreshold": lbuyThreshold, "sellThreshold": lsellThreshold, "liquidationValue": lbuy})
  });
}

if ((lsell !== 0)) {
  fetch('http://localhost:3001/liquidationAlerts', {
    method: "POST",
    body: JSON.stringify({"buyThreshold": lbuyThreshold, "sellThreshold": lsellThreshold, "liquidationValue": -lsell})
  });
}