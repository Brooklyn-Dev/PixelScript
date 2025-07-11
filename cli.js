import { createCanvas, loadImage } from "canvas";
import { extractBytes } from "./src/image.js";

const image = await loadImage("./examples/test.png");
const canvas = createCanvas(image.width, image.height);
const ctx = canvas.getContext("2d");
ctx.drawImage(image, 0, 0);

const bytes = extractBytes(canvas, ctx);
console.log(bytes);
