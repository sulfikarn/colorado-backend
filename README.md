# Wrapper APIs FOR AIR QUALITY MONITORING

## Prerequisites

```sh
- nodejs 12 +
- yarn
```

## Before running

The project needs some enviornment variables defined to run. Have a .env file created and placed at the root of the directory with the appropriate values. kindly note, there is no need for quotes for env. Eg  `SEWIO_RTLS_URL=https://www.example.com`

```js
PORT=""
BASE_URL=""
API_AUTH_KEY=""
AUTH_KEY=""
APP_BUNDLE_ID=""
SECRET=""
MONGO_DB_CONNECT="" // Mongo srv link
ELASTIC_NODE=""
DEVICE_DB=""  // Device collection name
NOTIFICATION_DB=""  // Notification collection name
METRICS_INDEX=""
```

The different configurations with which the project is run can be seen in the constant file. Tweak the values according to your needs which includes changing the time interval with which the validations happen. The Auth keys for the project is defined in the platform api document.

## How To Install

```sh
yarn install
yarn run build
yarn run start
```

## Using docker

```bash
docker build . -t <container-name>
docker run -d --name --p 8000:8000 <give-name> --env-file=.env <container-name>
```

## Contribution Guidelines

See [here](CONTRIBUTING.MD)
