/*

lines.js - qemu-log lines

"MIT License"

Copyright (c) 2013 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

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