var express = require('express');
var router = express.Router();

const Actions = require('../services/actions')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/carpark', async (req,res) => {
  const carparks = await Actions.getCarparkAvailability()
  console.log(carparks)
  res.send('HI')
})

/* GET Carpark Availability */

module.exports = router;
