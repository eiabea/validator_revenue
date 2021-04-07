![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/eiabea/validator_revenue)

# Validator revenue

Simple [alpine](https://alpinelinux.org/) container to get latest price and performance of an eth2 validator written with [nest.js](https://nestjs.com/). Fetched data gets stored into an [InfluxDB](https://www.influxdata.com/products/influxdb/) which can act as a data source for [Grafana](https://grafana.com/)

API provided by [beaconcha.in](https://beaconcha.in/)

# Usage

## Docker

### Pre-requirements:

- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

1. Rename `.env.example` to `.env` and adopt the values
2. Rename `validator.json.example` to `validator.json` and adopt the values. All the shares of the stakers should add up to 32 ;)
3. Start the application
    ```
    $ docker-compose up
    ```

# Grafana

1. Login to your grafana instance
2. Go to `Create` -> `Import`
3. Upload file [dashboard.json](grafana/dashboard.json)
4. Select the influxdb as datasource