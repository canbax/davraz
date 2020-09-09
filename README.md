# Davraz

A graph visualization and exploration tool. Firstly designed for tiger graph database, might support other graph databases in the feature. Check the [introductory video](https://www.youtube.com/watch?v=I8BgFve4sA8)

1. To visualize a tiger graph database, fill [db-config.json](db-config.json) file. You should fill everything except for `token` and `tokenExpire` fields.
2. Run `node proxy_server.js` to run proxy server. Proxy server makes HTTP request to Tiger Graph REST API and passes responses to the client-side.
3. Run `npm run ng s` to run angular in development mode.
4. Open http://localhost:4200 if everything is OK, `Data>Sample Data` should bring some data from your Tiger Graph Database. 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.4.

## todo (or might todo)

* adding/updating graph elements 
* client-side filterig with raw cytoscape.js
* badges on the nodes
* show statistics
* graph theoretical properties
* support for Neo4j

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/` . The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module` .

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
