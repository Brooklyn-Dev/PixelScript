# PixelScript

![GitHub issues](https://img.shields.io/github/issues/Brooklyn-Dev/PixelScript)

PixelScript is a stack-based esolang where code is embedded directly within PNG image pixels.

Made for HackClub's [_Twist_](https://twist.hackclub.dev/) YSWS.

**Note** - Project is fully functional in the web editor. Exporting programs as PNG images works in most cases, but complex programs may decode (in web and CLI) incorrectly - due to PNG parsing which is mostly  out of my control. I didn’t have time to fully fix this, everything else is solid.

## Features

-   Pixel-encoded esolang (programs are PNGs!)
-   Stack-based virtual machine
-   Arithmetic, logic, variables, functions, output, exception handling
-   Web-based pixel/code editor

## Web Usage
- Visit the editor at [pixel-script.vercel.app](https://pixel-script.vercel.app)
- Write code using the pixel editor, run program, and export as PNG.

## CLI Usage (Node.js)

Ensure node.js is installed before proceeding.

```bash
# Clone git repo
git clone https://github.com/Brooklyn-Dev/PixelScript.git
cd PixelScript

# Run CLI
node cli.js <path-to-png>
```

If you want to write code "manually", edit the cli code and directly pass in a JavaScript array of the bytecode you want to execute.

### Fibonacci Example

Outputs the first 10 numbers of the fibonacci sequence.

```js
import Interpreter from "./src/interpreter.js";
import "./src/injectOpcodes.js";

const fibonacci = [
    // Init vars
	PUSH, 0, STORE, 0,  // store a = 0
	PUSH, 1, STORE, 1,  // store b = 1
	PUSH, 0, STORE, 2,  // store i = 0

	// Define function 0
	FUNC, 0,

	LOAD, 0,           // load a
	PRINTLN_NUM,       // print a

	LOAD, 0,           // load a
	LOAD, 1,           // load b
	ADD, STORE, 3,     // store temp = a + b

	LOAD, 1,           // load b
	STORE, 0,          // store a = b

	LOAD, 3,           // load temp
	STORE, 1,          // store b = temp

	LOAD, 2,           // load i
	PUSH, 1,           // push 1
	ADD, STORE, 2,     // store i = i + 1

	LOAD, 2,           // load i
	PUSH, 10,          // push 10
	LT,                // i < 10
	CALLP, 0,          // callp 0

	RETURN,            // return

	// Main program
	CALL, 0,           // call function 0
	HALT               // halt
];

const interpreter = new Interpreter(
	(msg) => process.stdout.write(msg),
	(err) => process.stderr.write(err)
);

interpreter.run(fibonacci);
```

## Language Syntax

Variables and functions use IDs from `0–255`.

#### Stack Operations

-   0x01 `PUSH <value>` – Push a literal value onto the stack
-   0x02 `POP` – Discard the top value of the stack
-   0x03 `DUP` – Duplicate the top value on the stack
-   0x04 `SWAP` – Swap the top two values on the stack

#### Arithmetic Operations

-   0x10 `ADD` – Pop twice, Push result of addition
-   0x11 `SUB` – Pop twice, Push result of subtraction
-   0x12 `MUL` – Pop twice, Push result of multiplication
-   0x13 `DIV` – Pop twice, Push result of division (can throw DivisionByZero)
-   0x14 `MOD` – Pop twice, Push result of modulo (can throw DivisionByZero)
-   0x15 `EXP` – Pop twice, Push result of exponentiation

#### Logic Operations

-   0x20 `EQ` – Pop, Push 1 if equal, else 0
-   0x21 `NEQ` – Pop, Push 1 if not equal, else 0
-   0x22 `GT` – Pop, Push 1 if second > top
-   0x23 `LT` – Pop, Push 1 if second < top

#### Control Flow

-   0x30 `HALT` – Stop execution immediately

#### Variables

-   0x40 `STORE <id>` – Pop and store value to variable id
-   0x41 `LOAD <id>` – Push value from variable id

#### Functions

-   0x50 `CALL <func-id>` – Call function unconditionally
-   0x51 `CALLZ <func-id>` – Call if top of stack is 0
-   0x52 `CALLNZ <func-id>` – Call if top of stack != 0
-   0x53 `CALLP <func-id>` – Call if top of stack > 0
-   0x54 `RETURN` – Return from function
-   0x55 `FUNC <func-id>` – Declare a function block

#### I/O

-   0x60 `PRINT_NUM` – Pop, print (no newline)
-   0x61 `PRINT_CHAR` – Pop, print as ASCII char (no newline)
-   0x62 `PRINTLN_NUM` – Pop, print with newline
-   0x63 `PRINTLN_CHAR` – Pop, print as ASCII char with newline

#### Exception Handling

-   0x70 `TRY` – Begin try block
-   0x71 `CATCH <count> <type1> ...` – Catch matching exceptions
    -   `count = 0` catches all errors
    -   Currently only supports `DivisionByZero`
-   0x72 `END_TRY` – End try block

## Like this project?

If you find this project interesting or useful, consider giving it a star ⭐️!
