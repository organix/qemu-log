/*
 * lines.js - qemu-log lines
 *
 * (C) 2013 Tristan Slominski
 */
"use strict";

var clie = require('clie'),
    fs = require('fs'),
    path = require('path');

var lines = module.exports = clie.command(function (args) {
	if (args.length < 1) return lines.data(lines.usage).end();

	var file = path.normalize(args.shift());

	if (!fs.existsSync(file)) return lines.error("File '"+file+"' not found").end();

	var lastNewlineIndex = 0;
	var dataBuffer = "";

	var reader = fs.createReadStream(file, {encoding: 'utf8'});
	reader.on('readable', function () {
		var data = reader.read();
		
		if (dataBuffer.length > 0) {
			data = dataBuffer + data;
			dataBuffer = "";
			lastNewlineIndex = 0;
		}

		for (var i = 0; i < data.length; i++) {
			if (data[i] === '\n') {
				if (i > 0) {
					lines.data(data.slice(lastNewlineIndex, i));
				}
				lastNewlineIndex = i + 1;
			}
		}
		if (lastNewlineIndex != data.length) {
			dataBuffer = dataBuffer + data.slice(lastNewlineIndex);
		}
	});
	reader.on('end', function () {
		if (dataBuffer) {
			lines.data(dataBuffer);
		}
		lines.end();
	});
});

lines.usage = [
  "Usage: qemu-log lines <log>"
].join('\n');