'use strict';

var express = require('express');

var route = module.exports = new express.Router();

route.get('/', function (req, res) {
  res.end('Hello World!');
});
