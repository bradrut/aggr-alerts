# aggr-alerts
An application to process cryptocurrency liquidation notifications from AGGR and send alerts using the Telegram API. This application contains three components:

1. **AGGR**
    - This is the base [AGGR application](https://github.com/Tucsky/aggr) which connects to crypto sources via websockets and serves up the application UI. The aggr directory in this repo is an embedded git repository of the official repo, so to build from scratch, you must manually pull and run that project.
2. **aggr-redis**
    - A Redis instance to be used by the `aggr-telegram-service`. See the `aggr-redis` directory for more details.
3. **aggr-telegram-service**
    - A custom REST API built with Node.js and Express to process notifications from the AGGR application built-in script box. See the `aggr-telegram-service` directory for more details.

The root directory contains a `docker-compose.yml` file to build these three components into networked Docker images.
