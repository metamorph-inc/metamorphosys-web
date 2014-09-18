`WorkspaceList` components lists all workspaces in a WebGME project that uses the `ADMEditor` meta-model.

Workspace item structure

* `id` - {string} identifier
* `name` - {string} displayed name
* `toolTip` - {string} tool tip on displayed name
* `description` - {string} short description of the content
* `lastUpdated` - {object} 
    - `time` - {date|string} date of last update
    - `user` - {name} username who last updated
* `stats` - {array of object} summary of statistics (components, design spaces, test benches, requirements)

See `demo.js` for an example.