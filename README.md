## COP Data API Service
CRUD API to postgrest transactional data

## Requirements

* npm 6.9.0 (minimum working version)
* node v8.10.0 (minimum working version)

## Usage
To use this API first clone this repo
```sh
git clone git@github.com:UKHomeOffice/cop-data-api.git
```

### Development
Once you've cloned the project, set the following environment variables
```sh
export DB_CONNECTION_STRING=postgres://authenticatoroperation:auth1234@localhost:5434/operation
```

Install project dependencies
```sh
$ npm install
```

Run the API server
```sh
$ npm run start
```

Run the API server with debugger
```sh
$ mocha --inspect-brk server.js
```

#### Runing tests

```sh
# run mocha tests
$ npm run test

# run mocha tests for a specific file
$ npm run test test/db/utils.test.js

# run mocha tests for a specific folder
$ npm run test test/utils/

# run mocha tests with coverage
$ npm run coverage

# run mocha tests for a specific file with a breakpoint
$ mocha --inspect-brk test/db/utils.test.js
```

## Endpoints
```sh
# <domain>/<version>/<table>
http://localhost:5000/v1/roles
```

## Build and run locally in docker

1. Ensure you have cloned the Operational flyway source from the internal repos.
2. Run the following to build the docker container and start up

```bash
docker network create db
docker network create web
OPERATIONAL_FLYWAY=/FULL_PATH_TO_FLYWAY_SOURCE/private_operational_flyway docker-compose up
```
