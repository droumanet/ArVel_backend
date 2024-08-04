/*----------------------------------------------------------------------------
  Analyzer
  ----------------------------------------------------------------------------
*/

function view(req, res) {
    console.log("*** going to sensor.ejs ***")
    res.header("Access-Control-Allow-Origin", "*");
    res.render('sensor.ejs')
}


export {view}