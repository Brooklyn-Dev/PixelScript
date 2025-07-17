import { createCanvas, loadImage } from "canvas";
import { extractBytes } from "./src/image.js";
import Interpreter from "./src/interpreter.js";

const image = await loadImage("program.png"); // This is bugged and not preserving bytes properly?
const canvas = createCanvas(image.width, image.height);
const ctx = canvas.getContext("2d");
ctx.drawImage(image, 0, 0);

const bytes = extractBytes(canvas, ctx);
console.log(bytes);

const interpreter = new Interpreter();
interpreter.run(bytes);
