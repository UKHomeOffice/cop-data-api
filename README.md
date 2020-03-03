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

#### Running linter
To run the linter using the npm run lint command you have to specify at least the directory you want linter to run.

To specify the directory and any additional arguments you need to add -- (double dash) before the arguments you want to pass, e.g.

```sh
# run lint in the current directory
$ npm run lint -- .

# run lint in the routes directory and fix all issues
$ npm run lint -- ./app/routes/ --fix
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
KEYCLOAK_CLIENT_ID=cop-data-db KEYCLOAK_URL=http://keycloak.lodev.xyz/auth/realms/dev OPERATIONAL_FLYWAY=/FULL_PATH_TO_FLYWAY_SOURCE/private_operational_flyway docker-compose up
```

### Clean up
To stop and clean up the docker process run:

```bash
docker-compose rm -vs
docker network rm db
docker network rm web
docker rmi quay.io/ukhomeofficedigital/cop-data-api:dev
```

**note** The docker networks my fail to remove if you have other containers using them.

## Roles

The API is secured using JWT keycloak tokens. It requires a claim called 'dbrole' to be included in the token.
The value given for dbrole will enable the API to switch to the correct role within the database.

## Filtering examples
Return columns name and age filtering user names matching 'John' and 'Rachel'
```bash
select=name,age&filter=name=in.(John, Rachel)
```

Return columns nationality with a limit of 3 rows
```bash
select=nationality&limit=3
```

Return all users where names match 'John' and 'Debbie'
```bash
filter=name=in.(John, Debbie)
```

Return all countries where names match 'Denmark', and 'Portugal'
```bash
filter=name=in.(Denmark, Portugal)
```

Return all users where name matches 'John'
```bash
filter=name=eq.John
```

Return all users where name is not equal to 'John'
```bash
filter=name=neq.John
```

Return user where name is 'John' and email is 'john@mail.com'
```bash
filter=name=eq.John&filter=email=eq.john@mail.com
```

Return only the entity schema
```bash
mode=schemaOnly
```

Return only the entity data
```bash
mode=dataOnly
```

Return only the entity data where user name matches 'John'
```bash
mode=dataOnly&filter=name=eq.John
```

# Drone secrets

Name|Example value
---|---
dev_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-devtest-drone?section=security_credentials
dev_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-devtest-drone?section=security_credentials
docker_password|xxx (Global for all repositories and environments)
docker_username|docker (Global for all repositories and environments)
drone_public_token|Drone token (Global for all github repositories and environments)
env_api_cop_image|quay.io/ukhomeofficedigital/cop-data-api
env_api_cop_keycloak_client_id|keycloak client name
env_api_cop_name|operational-data-api
env_api_cop_port|5000
env_api_cop_protocol|https://
env_api_cop_url|operational-data-api.dev.cop.homeoffice.gov.uk, operational-data-api.staging.cop.homeoffice.gov.uk, operational-data-api.cop.homeoffice.gov.uk
env_db_cop_hostname|xxx.yyy.zzz
env_db_cop_operation_authenticator_password|xxx
env_db_cop_operation_authenticator_username|xxx
env_db_cop_operation_dbname|xxx
env_db_cop_operation_schema|xxx
env_db_cop_options|?ssl=true
env_db_cop_port|5432
env_db_cop_protocol|postgres://
env_keycloak_protocol|https://
env_keycloak_realm|cop-dev, cop-staging, cop
env_keycloak_url|sso-dev.notprod.homeoffice.gov.uk/auth, sso.digital.homeoffice.gov.uk/auth
env_kube_server|https://kube-api-notprod.notprod.acp.homeoffice.gov.uk, https://kube-api-prod.prod.acp.homeoffice.gov.uk
env_kube_token|xxx
log_level_debug|debug
log_level_info|info
nginx_image|quay.io/ukhomeofficedigital/nginx-proxy
nginx_tag|latest
production_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
production_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
quay_password|xxx (Global for all repositories and environments)
quay_username|docker (Global for all repositories and environments)
slack_webhook|https://hooks.slack.com/services/xxx/yyy/zzz (Global for all repositories and environments)
staging_drone_aws_access_key_id|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
staging_drone_aws_secret_access_key|https://console.aws.amazon.com/iam/home?region=eu-west-2#/users/bf-it-prod-drone?section=security_credentials
