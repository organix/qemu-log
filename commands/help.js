/*
 * help.js - qemu-log help
 *
 * (C) 2013 Tristan Slominski
 */
"use strict";

var clie = require('clie');

var help = module.exports = clie.command(function (args) {
	help.data(help.usage).end();
});

help.usage = [
	"\nUsage: qemu-log <command>",
	"",
	"where <command> is one of:",
	"    help, lines, parse, top-blocks",
	"",
	"qemu-log <command> -h   quick help on <command>"
].join('\n');