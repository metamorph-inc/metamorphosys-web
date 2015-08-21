### Debugging Tricks ###
If a job fails and you need to investigate, you can download its "source" material:

1. Open Chrome's inspector
2. Reload the web app and switch to the *Analyze* tab
3. In the inspector, load the request from *?projectId=Template_Module_1x2*
4. Switch to _Preview_
5. Expand the _results_ key
6. In these results, *executionJobHash* identifies the source material
7. Download it here: http://server/rest/blob/download/HASH