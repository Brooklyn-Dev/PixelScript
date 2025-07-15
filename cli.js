import { createCanvas, loadImage } from "canvas";
import { extractBytes } from "./src/image.js";
import Interpreter from "./src/interpreter.js";

// const image = await loadImage("./examples/test.png");
// const canvas = createCanvas(image.width, image.height);
// const ctx = canvas.getContext("2d");
// ctx.drawImage(image, 0, 0);

// const bytes = extractBytes(canvas, ctx);

// Output two calculations: 16 + 9, 1 - 2
// Then output the sum of the results: 25 - 1 = 24
const example = [
	0x01, 0b10000, 0x01, 0b1001, 0x10, 0x03, 0x60, 0x01, 0b1, 0x01, 0b10, 0x11, 0x03, 0x60, 0x10, 0x60, 0x32,
];

const interpreter = new Interpreter();
interpreter.run(example);
