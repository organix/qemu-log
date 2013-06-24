#!/usr/bin/env node

var command = require('../index.js').cli();
command.on('data', function (data) {
	if (typeof data === "string") {
		console.log(data);
	} else {
    console.log(require('util').inspect(data, false, null));
  }
});
command.on('error', function (error) {
  if (typeof error === "string") {
    console.error(error);
  } else if (error instanceof Error) {
    console.error(error.stack || error.message);
  } else {
    console.error(error);
  }
});