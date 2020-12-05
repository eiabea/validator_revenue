![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/eiabea/validator_revenue)

# Validator revenue

Simple [alpine](https://alpinelinux.org/) container to get latest price and performance of an eth2 validator written with [nest.js](https://nestjs.com/). Fetched data gets stored into an [InfluxDB](https://www.influxdata.com/products/influxdb/) which can act as a data source for [Grafana](https://grafana.com/)

API provided by [beaconcha.in](https://beaconcha.in/)

# Usage

## Docker

### Pre-requirements:

- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

Rename `.env.example` to `.env` and adopt values

```
$ docker-compose up
```