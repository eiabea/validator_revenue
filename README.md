![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/eiabea/validator_revenue)

# Validator revenue

Simple [alpine](https://alpinelinux.org/) container to get latest revenue of an eth2 validator in dollar written in [Node.js](https://nodejs.org/en/)

API provided by [beaconcha.in](https://beaconcha.in/)

# Usage

## Docker

### Pre-requirements:

- [Docker](https://www.docker.com/)

```
$ docker run -e VALIDATOR=<YOUR VALIDATORS PUBLIC KEY> eiabea/validator_revenue
```

## Node

### Pre-requirements

- [Node.js](https://nodejs.org/en/)
- [git](https://git-scm.com/)

```
$ git clone https://github.com/eiabea/validator_revenue.git
$ cd validator_revenue
$ npm install
$ VALIDATOR=<YOUR VALIDATORS PUBLIC KEY> npm start
```

# Sample output:
```
{
  rev1d: 8.809719764,
  rev7d: 8.809719764,
  rev31d: 8.809719764,
  rev356d: 8.809719764
}
```