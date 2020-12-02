const axios = require('axios').default;

async function start() {

  const validator = process.env.VALIDATOR;

  if (!validator) {
    console.error("You need to provide a validator key");
    process.exit(1)
  }

  const latestState = await axios.get('https://beaconcha.in/latestState')
  const performance = await axios.get(`https://beaconcha.in/api/v1/validator/${validator}/performance`)

  const { ethPrice } = latestState.data
  const prefData = performance.data.data

  const revenue = {
    rev1d: ethPrice * prefData.performance1d / 1E9,
    rev7d: ethPrice * prefData.performance7d / 1E9,
    rev31d: ethPrice * prefData.performance31d / 1E9,
    rev356d: ethPrice * prefData.performance365d / 1E9,
  }
  console.log(revenue);
}

start()