import { extractBytes, loadImage } from "./src/image.js";
import Interpreter from "./src/interpreter.js";

const data = await loadImage("program.png");
const bytes = extractBytes(data);

const interpreter = new Interpreter(
	(message) => {
		process.stdout.write(message);
	},
	(message) => {
		process.stderr.write(message);
	}
);

interpreter.run(bytes);
