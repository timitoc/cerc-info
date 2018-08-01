# Web platform for competitive programming (school) clubs

This platform uses Node.js and MySQL.

## How to run the project on your machine

To run the project, install [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/install/). Then, run:

* If it's the first time (or after you pulled some new modifications):
```sh
docker-compose up --force-recreate --build
```

* Else:
```sh
docker-compose up
```


Open your browser at [http://localhost:3000](http://localhost:3000), aaand ... magic!

## How to make use of the API

Just make requests to [http://localhost:3000/api/INSERT_URL_HERE](http://localhost:3000/api/INSERT_URL_HERE). All the available requests are defined in the documentation.

## Documentation

To view the API docs, go to [http://localhost:3000/docs](http://localhost:3000/docs).

## Security

This project is security tested using [synk.io](https://snyk.io).

[![Known Vulnerabilities](https://snyk.io/test/github/andreigasparovici/cerc-info/badge.svg?targetFile=node%2Fpackage.json)](https://snyk.io/test/github/andreigasparovici/cerc-info?targetFile=node%2Fpackage.json)
