# qemu-log

    Stability: 1 - Experimental

_Stability as defined by [Node.js](http://nodejs.org/api/documentation.html#documentation_stability_index)_

QEMU log parsing utility.

## Installation

    npm install qemu-log

## Usage

    ~$ qemu-log
    
		Usage: qemu-log <command>
    
		where <command> is one of:
		    help, lines, parse, top-blocks
    
		qemu-log <command> -h   quick help on <command>

### qemu-log lines <log>

Parses a utf8 encoded text file and emits lines.

    ~$ qemu-log lines log.txt
    ... each line of log is displayed ...

### qemu-log parse <log>

    ~$ qemu-log parse log.txt

Parses a `utf8` encoded text files and emits one of:

#### trace

Block of execution entered at `trace.in`.

    { trace: { in: '0000004000ad7f60', out: '0x602ddc20' } }

#### in_asm

Target assembly code instructions corresponding to block with entry at `in_asm.in`.

		{ in_asm: 
		   { in: '0000004000ad7f60',
		     instructions: 
		      [ [ '0x0000004000ad7f60', 'mov', '%rdx,%rdi' ],
		        [ '0x0000004000ad7f63', 'mov', '%r8d,%eax' ],
		        [ '0x0000004000ad7f66', 'syscall' ] ] } }

#### out_asm

Host assembly code instructions corresponding to execution of target block

		{ out_asm: 
		   { instructions: 
		      [ [ '0x602ddc20', 'mov', '-0x38(%r14),%ebp' ],
		        [ '0x602ddc24', 'test', '%ebp,%ebp' ],
		        [ '0x602ddc26', 'jne', '0x602ddc62' ],
		        [ '0x602ddc2c', 'mov', '0x10(%r14),%rbp' ],
		        [ '0x602ddc30', 'mov', '%rbp,0x38(%r14)' ],
		        [ '0x602ddc34', 'mov', '0x40(%r14),%rbp' ],
		        [ '0x602ddc38', 'mov', '%ebp,%ebp' ],
		        [ '0x602ddc3a', 'mov', '%rbp,(%r14)' ],
		        [ '0x602ddc3d', 'mov', '$0x4000ad7f66,%rbp' ],
		        [ '0x602ddc47', 'mov', '%rbp,0x80(%r14)' ],
		        [ '0x602ddc4e', 'mov', '%r14,%rdi' ],
		        [ '0x602ddc51', 'mov', '$0x2,%esi' ],
		        [ '0x602ddc56', 'callq', '0x600a0870' ],
		        [ '0x602ddc5b', 'xor', '%eax,%eax' ],
		        [ '0x602ddc5d', 'jmpq', '0x6227feb6' ],
		        [ '0x602ddc62', 'mov', '$0x7f54e8fc03db,%rax' ],
		        [ '0x602ddc6c', 'jmpq', '0x6227feb6' ] ],
		     size: '81',
		     out: '0x602ddc20' } }

### qemu-log top-blocks <log>

Generates a listing of execution blocks based on total number of instructions executed (`instructionCount`).

		...
		{ executions: 145,
		  in: '0000000000400f30',
		  instructions: 
		   [ [ '0x0000000000400f30', 'push', '%rbp' ],
		     [ '0x0000000000400f31', 'mov', '%rsp,%rbp' ],
		     [ '0x0000000000400f34', 'sub', '$0x50,%rsp' ],
		     [ '0x0000000000400f38', 'mov', '%rdi,-0x10(%rbp)' ],
		     [ '0x0000000000400f3c', 'mov', '%rsi,-0x18(%rbp)' ],
		     [ '0x0000000000400f40', 'mov', '$0x400f30,%eax' ],
		     [ '0x0000000000400f45', 'mov', '-0x10(%rbp),%rcx' ],
		     [ '0x0000000000400f49', 'cmp', '(%rcx),%rax' ],
		     [ '0x0000000000400f4c', 'jne', '0x401057' ] ],
		  function: 'integer_kind',
		  instructionsCount: 1305,
		  percentOfTotal: 1.0062379039409057 }
		{ executions: 260,
		  in: '00000000004005f0',
		  instructions: 
		   [ [ '0x00000000004005f0', 'push', '%rbp' ],
		     [ '0x00000000004005f1', 'mov', '%rsp,%rbp' ],
		     [ '0x00000000004005f4', 'sub', '$0xe0,%rsp' ],
		     [ '0x00000000004005fb', 'test', '%al,%al' ],
		     [ '0x00000000004005fd', 'je', '0x400630' ] ],
		  function: 'object_call',
		  instructionsCount: 1300,
		  percentOfTotal: 1.0023825863012854 }
	  ...
