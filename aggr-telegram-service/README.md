# aggr-telegram-service
A service to process cryptocurrency liquidation notifications from AGGR and send alerts using the Telegram API.

## Environment Variables

The following table defines the environment variables that the application requires which should be specified within a Dotenv file.

| Variable name        | Required | Description                             |
| -------------------- | -------- | --------------------------------------- |
| PORT                 | NO       | The port that the app will run on. Defaults to `3000`.       |
| TELEGRAM_BOT_TOKEN   | YES      | The bot token generated from the Telegram API that identifies the custom bot.  |
| TELEGRAM_BOT_CHAT_ID | YES      | The Telegram Channel ID for the channel the alerts should be sent to. |
| REDIS_HOST           | NO       | The host name or IP (or Docker container alias, if running on a Docker network) on which Redis server is running; used in the Redis connection URL. Defaults to `redis`. |
| REDIS_PORT           | NO       | The port on which the Redis server is exposed; used in the Redis connection URL. Defaults to `6379`. |

## Versioning

If updating the aggr-telegram-service, the version should be bumped within:
- This project's `package.json` file
- The `docker-compose.yml` file (at the root directory of this *repo*, one directory above here), so that we create a new tag version and don't overwrite a previous version of the app in Docker Hub

### Publishing a new version to Docker Hub
Once the versions have been bumped in the appropriate aformentioned files, if you want to only publish the new `aggr-telegram-service` version (without re-building the `aggr` and `aggr-redis` images), in the root directory of the repo where the `docker-compose.yml` file lives, run:

`docker-compose build aggr-telegram-service`

This builds the new version of the image without starting up a container. After any testing, to push that new image version up to Docker Hub, run:

`docker push bradrut/aggr-telegram-service:tagname`

where `tagname` is the new version.
