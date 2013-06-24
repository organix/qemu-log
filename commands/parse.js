/*
 * parse.js - qemu-log parse
 *
 * (C) 2013 Tristan Slominski
 */
"use strict";

var clie = require('clie'),
    fs = require('fs'),
    path = require('path');

var parse = module.exports = clie.command(function (args) {
	if (args.length < 1) return parse.data(parse.usage).end();

	var state = 'ready';
  var in_asmBlock = {
  	in_asm: {
	  	in: null,
	  	instructions: []
  	}
  };
  var out_asmBlock = {
  	out_asm: {
  		instructions: []
  	}
  };

	var qemu = require('../index.js');
	var lines = qemu.commands.lines(args);
	lines.on('data', function(data) {
		switch (state) {
			case 'in_asm preamble':
			  if (data.match(/^IN: /)) {
			  	var line = data.split(/ +/);
			  	if ((line.length > 1) && (line[1].length > 0)) {
			  		in_asmBlock.in_asm.function = line[1];
			  	}
			  	return state = 'in_asm';
			  }
			  return state = 'ready';
				break;
			case 'in_asm':
			  // example data line:
			  // 0x0000004000ad7f33:  mov    0x2d7ede(%rip),%r9        # 0x4000dafe18
			  if (data.length == 0) {
			  	if (in_asmBlock.in_asm.in) {
			  		parse.data(in_asmBlock);
			  		in_asmBlock = {
			  			in_asm: {
					  		in: null,
					  		instructions: []
					  	}
				  	};
			  	}
			  	return state = 'ready';
			  }

			  var instruction = data.split(/ +/);
			  if (!in_asmBlock.in_asm.in) {
			  	in_asmBlock.in_asm.in = 
			  			instruction[0].slice(2, instruction[0].length - 1);
			  }
			  var parsedInstruction = [];
			  var parsedComments = "";
			  for (var i = 0; i < instruction.length; i++) {
			  	if (i < 3 && instruction[i].length > 0) {
			  		if (i == 0) {
			  			parsedInstruction.push(
			  					instruction[i].slice(0, instruction[i].length - 1));
			  		} else {
			  			parsedInstruction.push(instruction[i]);
			  		}
			  		continue;
			  	}
			  	parsedComments += instruction[i] + " ";
			  }
			  parsedComments = parsedComments.trim();
			  if (parsedComments.length > 0) {
			  	parsedInstruction.push(parsedComments);
			  }
			  in_asmBlock.in_asm.instructions.push(parsedInstruction);
			  break;
			case 'out_asm':
			  // example OUT line:
			  // 0x6227fead:  add    $0xfffffffffffffb78,%rsp
			  if (data.length == 0) {
			  	if (out_asmBlock.out_asm.out) {
			  		parse.data(out_asmBlock);
			  		out_asmBlock = {
			  			out_asm: {
			  				instructions: []
			  			}
			  		};
			  	}
			  	return state = 'ready';
			  }

			  var instruction = data.split(/ +/);
			  if (!out_asmBlock.out_asm.out) {
			  	out_asmBlock.out_asm.out = 
			  			instruction[0].slice(0, instruction[0].length - 1);
			  }
			  var parsedInstruction = [];
			  for (var i = 0; i < instruction.length; i++) {
			  	if (i == 0) {
			  		parsedInstruction.push(
			  				instruction[i].slice(0, instruction[i].length - 1))
			  	} else {
			  		parsedInstruction.push(instruction[i]);
			  	}
			  }
			  out_asmBlock.out_asm.instructions.push(parsedInstruction);
			  break;
			case 'out_asm prologue':
			  // example PROLOGUE line:
			  // 0x6227fead:  add    $0xfffffffffffffb78,%rsp
			  if (data.length == 0) {
			  	if (out_asmBlock.out_asm.prologue) {
			  		parse.data(out_asmBlock);
			  		out_asmBlock = {
			  			out_asm: {
			  				instructions: []
			  			}
			  		};
			  	}
			  	return state = 'ready';
			  }

			  var instruction = data.split(/ +/);
			  if (!out_asmBlock.out_asm.out) {
			  	out_asmBlock.out_asm.out = 
			  			instruction[0].slice(0, instruction[0].length - 1);
			  }
			  out_asmBlock.out_asm.instructions.push(instruction);
			  break;
			case 'ready':
			  if (data.match(/^-+$/)) return state = 'in_asm preamble';

			  if (data.match(/^Trace 0x/)) { // state = 'trace';
			  	// example trace line:
			    // Trace 0x602c5c30 [00000000004005f0] object_call
			  	var trace = data.split(/ +/);
			  	var traceObject = {
			  		trace: {
			  			in: trace[2].slice(1, trace[2].length - 1),
			  			out: trace[1]
			  		}
			  	}
			  	if (trace.length == 4 && trace[3].length > 0) {
			  		traceObject.trace.function = trace[3];
			  	}
			  	return parse.data(traceObject);
			  }

			  if (data.match(/^PROLOGUE: /)) {
			  	var prologue = data.split(/ +/);
			  	if (!out_asmBlock.out_asm.size) {
			  		out_asmBlock.out_asm.size = 
			  		    // [size=40]
			  				prologue[1].slice(6, prologue[1].length - 1)
			  	}
			  	return state = 'out_asm prologue';
			  }

			  if (data.match(/^OUT: /)) {
			  	var out = data.split(/ +/);
			  	if (!out_asmBlock.out_asm.size) {
			  		out_asmBlock.out_asm.size =
			  			// [size=40]
			  			out[1].slice(6, out[1].length - 1);			  		
			  	}
			  	return state = 'out_asm';
			  }
			  break;
			default:
			  return state = 'ready';
			  break;
		}
	});
	lines.on('end', function () {
		parse.end();
	});
});

parse.usage = [
  "Usage: qemu-log parse <log>"
].join('\n');