import { createCanvas, loadImage } from "canvas";
import { extractBytes } from "./src/image.js";
import Interpreter from "./src/interpreter.js";

// const image = await loadImage("./examples/test.png");
// const canvas = createCanvas(image.width, image.height);
// const ctx = canvas.getContext("2d");
// ctx.drawImage(image, 0, 0);

// const bytes = extractBytes(canvas, ctx);

// prettier-ignore
const helloWorld = [
	0x01, 72,  0x61, // H
	0x01, 101, 0x61, // e
	0x01, 108, 0x61, // l
	0x01, 108, 0x61, // l
	0x01, 111, 0x61, // o
	0x01, 44,  0x61, // ,
	0x01, 32,  0x61, // space
	0x01, 87,  0x61, // W
	0x01, 111, 0x61, // o
	0x01, 114, 0x61, // r
	0x01, 108, 0x61, // l
	0x01, 100, 0x61, // d
	0x01, 33,  0x63, // !
	0x32,            // HALT
];

const interpreter = new Interpreter();
interpreter.run(helloWorld);
