Contains all source files that are developed as part of the project. May contain external libraries too.

- `app` - domain specific applications, one application per subdirectory
- `decorators` - domain specific decorators for `WebGME UI`
- `docs` - documentation and UI preview of the `cyphy-components` from `library`
- `library` - `cyphy-components` angular module that contains domain specific directives, controllers, and services.
- `panels` - domain specific panels for `WebGME UI`
- `plugins` - domain specific plugins exporters, importers, and execution of test benches.
- `rest` - server side domain specific rest APIs and services like `DESERT`
- `sandbox` - put any self contained html files if experimenting with APIs
- `widgets` - domain specific widgets for `WebGME UI`

## Where to put new components? ##

|               | WGS Use| Sets DB id | Gets DB id  | SDB id  | MDB id | Sets PB | Get State | Set State |
| ------------- |:------:|:----------:|:-----------:|:-------:|:------:|:-------:|:---------:|:---------:|
| CyPhy Services|   Y    | NO         | NO          | YES     | YES    | NO      | NO        | NO        |
| Controller/Directive A | N | NO     | YES         | YES     | NO     | NO      | NO        | NO        |
| Controller/Directive B | Y | NO     | YES         | YES     | NO     | YES     | YES       | YES       |
| Views/Controllers  | ? | YES        | YES         | YES     | YES    | ?       | YES       | YES       |
| Applications  | NO     | NO         | NO          | NO      | NO     | NO      | YES       | YES       |

Acronyms
- WGS - WebGME Services
- DB id - database connection id. A single connection can be conneted to a project and a branch or commit.
- SDB id - single database connection id
- MDB id - multiple database connection ids. For instance for a diff view/tool.

### CyPhy Services ###
TODO

### Controller/Directive A ###
Can be tested with CyPhy Service mock, i.e. does not use WebGME Services directly.

### Controller/Directive B ###
TODO

### Views/Controllers ###
TODO

### Applications ###
TODO

