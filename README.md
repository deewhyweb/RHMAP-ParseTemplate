# Parse on Red Hat Mobile (Node.js 0.10.30)

This is a template that will enable the execution of Parse (parse-server) on 
the Red Hat Mobile Appliaction Platform.

# How does this work?
Application startup will find all parse-server files and convert them from ES6 
to ES5 JavaScript using Babel.

# Running Locally

Clone locally, cd into the cloned folder and do the following:

```
npm install
grunt serve
```

You should see some logs but will finally see output similar to this:

```
App started at: Thu Feb 04 2016 12:07:26 GMT-0600 (CST) on port: 8001
```

Now try opening [http://127.0.0.1:8001/parse/ping](http://127.0.0.1:8001/parse/ping)
you should get a response saying unauthorised since you didn't include the 
required authorization headers, but this means it's working!
