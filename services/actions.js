const Axios = require('axios');

async function getCarparkAvailability(){
  return await Axios.get('https://api.data.gov.sg/v1/transport/carpark-availability')
                    .then(res => (
                      {
                        timestamp:res.data.items[0].timestamp,
                        data:res.data.items[0].carpark_data[0].carpark_info
                      }
                    ))
                    .catch(err => err);
}

async function getClosestCarpark(){
  
}
module.exports = {
  getCarparkAvailability,
};
