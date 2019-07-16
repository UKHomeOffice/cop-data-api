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
npm run start
```

Run the API server with debugger
```sh
mocha --inspect-brk server.js
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
http://localhost:5000/v1/roles
http://localhost:5000/v1/staff
http://localhost:5000/v1/getroles
```
