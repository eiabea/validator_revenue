const axios = require('axios').default;

async function start() {
  // Extract public key from environment
  const { VALIDATOR } = process.env;

  // Check if a public key got provided
  if (!VALIDATOR) {
    console.error("You need to provide a validator key");
    process.exit(1)
  }

  // Fetch the latest state object from beaconcha.in 
  const latestState = await axios.get('https://beaconcha.in/latestState')
  // Fetch the performance object for the validator from beaconcha.in 
  const performance = await axios.get(`https://beaconcha.in/api/v1/validator/${VALIDATOR}/performance`)

  // Get relevant data from the responses
  const { ethPrice } = latestState.data
  const prefData = performance.data.data

  // Build revenue object
  const revenue = {
    rev1d: ethPrice * prefData.performance1d / 1E9,
    rev7d: ethPrice * prefData.performance7d / 1E9,
    rev31d: ethPrice * prefData.performance31d / 1E9,
    rev356d: ethPrice * prefData.performance365d / 1E9,
  }

  // Present it to the user
  console.log(revenue);
}

start()