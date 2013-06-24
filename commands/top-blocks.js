/*
 * topBlocks.js - qemu-log top-blocks
 *
 * (C) 2013 Tristan Slominski
 */
"use strict";

var clie = require('clie');

var topBlocks = module.exports = clie.command(function (args) {
	if (args.length < 1) return topBlocks.data(topBlocks.usage).end();	

	var blocks = {};

	var qemu = require('../index.js');
	var parser = qemu.commands.parse(args);
	parser.on('data', function (data) {
		// capture trace events and log in_asm instructions for reference
		if (data.trace) {
			if (!blocks[data.trace.in]) {
				blocks[data.trace.in] = {
					executions: 0,
					in: data.trace.in
				};
			}
			blocks[data.trace.in].executions++;
		} else if (data.in_asm) {
			if (!blocks[data.in_asm.in]) {
				blocks[data.in_asm.in] = {
					executions : 0,
					in: data.in_asm.in
				};
			}
			if (!blocks[data.in_asm.in].instructions) {
				blocks[data.in_asm.in].instructions = data.in_asm.instructions;
				if (data.in_asm.function) {
					blocks[data.in_asm.in].function = data.in_asm.function;
				}
			}
		}
	});
	parser.on('end', function () {
		var totalInstructionCount = 0;

		var sortedBlocks = [];
		Object.keys(blocks).forEach(function (blockKey) {
			var block = blocks[blockKey];
			block.instructionsCount = block.executions * block.instructions.length;
			// gather total instruction numbers for percentages
			totalInstructionCount += block.instructionsCount;
			sortedBlocks.push(block);
		});

		sortedBlocks.sort(function (a, b) {
			return b.instructionsCount - a.instructionsCount
		});

		sortedBlocks.forEach(function (block) {
			block.percentOfTotal = 
					block.instructionsCount / totalInstructionCount * 100;
			topBlocks.data(block);
		})
		topBlocks.end();
	});
});

topBlocks.usage = [
  "Usage: qemu-log top-blocks <log>"
].join('\n');