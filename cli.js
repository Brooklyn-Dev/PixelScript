import { extractBytes } from "./src/extractBytes.js";
import Interpreter from "./src/interpreter.js";
import { loadImage } from "./src/loadImage.js";

const args = process.argv.slice(2);

if (args.length === 0) {
	console.log("Usage: node cli.js <png-path>");
	process.exit(1);
}

const pngPath = args[0];

try {
	const imageData = await loadImage(pngPath);
	const bytes = extractBytes(imageData);

	const interpreter = new Interpreter(
		(msg) => process.stdout.write(msg),
		(err) => process.stderr.write(err)
	);

	interpreter.run(bytes);
} catch (err) {
	console.error(`Failed to load or execute program: ${err.message}`);
	process.exit(1);
}
