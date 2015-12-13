Generic Rest Server
===================
##### An instant deployable REST and Socket server with authorization and hooks available

```
> npm install -g generic_rest_server
> generic-rest-server
> curl --data "afield=helloworld" http://localhost:1828/sample_collection
> curl http://localhost:1828/sample_collection
```

This is a generic REST server that will give and take any information thrown at it.
I've built this for prototyping apps, although if security isn't a major concern, then I can't see a reason not to use it on simple production sites [ie. a personal blog].
The server runs on Node and the data is stored in MongoDB.
Everything can be configured using a config file (Including function hooks) you pass as the only parameter to the executable.
See the config.js in source for what can be set, and the format for setting collections and groups.

```
> generic-rest-server ~/myconfig.js
```

The urls are all "/:collection" with the data determining what to create, change or query. In the case of a "PUT" edit, the _id will be used to edit it.

The server supports both authorization and file upload/download.

You can add files by "PUT"ing to "/__file/:folder" and returned will be the object:
{url: <url path of file>, type: <type of file>}

**Todo: an explanation of the configs and how to set authorization in configs in this README**
Also, I think you need to install mongoDB before this well work... I should look into how to have this app install mongoDB for the user.
