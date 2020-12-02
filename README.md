![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/eiabea/validator_revenue)

# Validator revenue

Simple [alpine](https://alpinelinux.org/) container to get latest revenue of an eth2 validator in dollar written in [Node.js](https://nodejs.org/en/)

API provided by [beaconcha.in](https://beaconcha.in/)

# Usage

```
$ docker run -e VALIDATOR=<YOUR VALIDATORS PUBLIC KEY> eiabea/validator_revenue
```

Sample output:
```
{
  rev1d: 8.809719764,
  rev7d: 8.809719764,
  rev31d: 8.809719764,
  rev356d: 8.809719764
}
```