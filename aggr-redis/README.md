# aggr-redis
This directory contains the redis.conf file that has been configured as needed for aggr-alerts (specifically, to be used by the [aggr-telegram-service](https://github.com/bradrut/aggr-telegram-service)).

Because Redis is installed on the system level and not at the project level, this directory does not contain that installation. However, a Dockerfile has been provided to build an instance of the official Redis Docker image using our custom redis configuration. The aggr-telegram-service Docker container will communicate with the Redis Docker container via networking which will be defined in the project's `docker-compose.yml` (in the root directory of this repo). 
