import { createCanvas, loadImage } from "canvas";
import { extractBytes } from "./src/image.js";
import Interpreter from "./src/interpreter.js";

// const image = await loadImage("./examples/test.png");
// const canvas = createCanvas(image.width, image.height);
// const ctx = canvas.getContext("2d");
// ctx.drawImage(image, 0, 0);

// const bytes = extractBytes(canvas, ctx);

// prettier-ignore
const fibonacci = [
    // Init vars
	0x01, 0, 0x40, 0,  // store a = 0
	0x01, 1, 0x40, 1,  // store b = 1
	0x01, 0, 0x40, 2,  // store i = 0

	// Define function 0
	0x55, 0,

	0x41, 0,           // load a
	0x62,              // print a

	0x41, 0,           // load a
	0x41, 1,           // load b
	0x10, 0x40, 3,     // store temp = a + b

	0x41, 1,           // load b
	0x40, 0,           // store a = b

	0x41, 3,           // load temp
	0x40, 1,           // store b = temp

	0x41, 2,           // load i
	0x01, 1,           // push 1
	0x10, 0x40, 2,     // store i = i + 1

	0x41, 2,           // load i
	0x01, 10,          // push 10
	0x23,              // i < 10
	0x53, 0,           // callp

	0x54,              // return

	// Main program
	0x50, 0,        // call function 0
	0x30            // halt
];

const interpreter = new Interpreter();
interpreter.run(fibonacci);
