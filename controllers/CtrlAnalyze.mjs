/*----------------------------------------------------------------------------
  Analyzer
  ----------------------------------------------------------------------------
*/


    function view(req, res) {
        console.log("*** going to installation.ejs ***")
        res.render('analyze.ejs')
    }


export {view}