Contains all source files that are developed as part of the project. May contain external libraries too.

- `app` - domain specific applications, one application per subdirectory
- `client` - [DEPRECATED] old version/implementation of a single client application. Will be removed soon.
- `decorators` - domain specific decorators for `WebGME UI`
- `docs` - documentation and UI preview of the `cyphy-components` from `library`
- `library` - `cyphy-components` angular module that contains domain specific directives, controllers, and services.
- `panels` - domain specific panels for `WebGME UI`
- `plugins` - domain specific plugins exporters, importers, and execution of test benches.
- `rest` - server side domain specific rest APIs and services like `DESERT`
- `sandbox` - put any self contained html files if experimenting with APIs
- `widgets` - domain specific widgets for `WebGME UI`


|               | WGS Use| WGS Update | Sets DB id | Gets DB id  | SDB id  | MDB id | Sets PB | Get State | Set State |
| ------------- |:------:|:----------:|:----------:|:-----------:|:-------:|:------:|:-------:|:---------:|:---------:|
| Services WDCT |   Y    |     ?      | NO         | NO          | YES     | YES    | NO      | NO        | NO        |
| Controller/Directive A | N | N      | NO         | YES         | YES     | NO     | NO      | NO        | NO        |
| Controller/Directive B | Y | Y      | NO         | YES         | YES     | NO     | YES     | YES       | YES       |
| Views/Controllers  | ? | ?          | YES        | YES         | YES     | YES    | ?       | YES       | YES       |
| Applications  | NO     | NO         | NO         | NO          | NO      | NO     | NO      | YES       | YES       |
