import { extractBytes } from "../src/image";
import Interpreter from "../src/interpreter";
import PixelEditor from "./editor";
import encodeBytecode from "./utils/bytecodeEncoder";
import encodeImage from "./utils/imageEncoder";
import { OPCODE_CATEGORIES, OPCODES } from "./utils/opcodes";

const fileInput = document.querySelector(".editor__toolbar-file-input");
const exportBtn = document.querySelector(".editor__toolbar-export-btn");
const modeBtn = document.querySelector(".editor__toolbar-mode-btn");
const runBtn = document.querySelector(".editor__toolbar-run-btn");
const outputPre = document.querySelector(".editor__output");
const palette = document.querySelector(".editor__palette");
const canvas = document.querySelector(".editor__canvas");
const canvasOverlay = document.querySelector(".editor__canvas-overlay");

const pixelEditor = new PixelEditor(canvas, canvasOverlay);

// Mode
let mode = "opcode";
modeBtn.addEventListener("click", () => {
	mode = mode === "opcode" ? "literal" : "opcode";
	modeBtn.textContent = `Mode: ${mode === "opcode" ? "Draw Opcode" : "Enter Data"}`;
	pixelEditor.toggleMode();
});

// Categorise opcodes
const categories = {};
for (const opcode of OPCODES) {
	const category = parseInt(opcode.code) & 0xf0;
	if (!categories[category]) {
		categories[category] = [];
	}
	categories[category].push(opcode);
}

// Create categorised palette
let firstItem = null;

for (const [category, opcodes] of Object.entries(categories)) {
	const categoryDiv = document.createElement("div");
	categoryDiv.className = "editor__palette-category";

	const title = document.createElement("div");
	title.className = "editor__palette-category-title";
	title.textContent = OPCODE_CATEGORIES[category];
	categoryDiv.appendChild(title);

	const row = document.createElement("div");
	row.className = "editor__palette-row";

	for (const opcode of opcodes) {
		const item = document.createElement("div");
		item.className = "editor__palette-item";
		item.textContent = opcode.name;
		item.style.backgroundColor = opcode.colour;
		item.dataset.code = opcode.code;

		if (!firstItem) firstItem = item;

		item.addEventListener("click", () => {
			document.querySelectorAll(".editor__palette-item").forEach((el) => {
				el.classList.remove("editor__palette-item--selected");
			});

			item.classList.add("editor__palette-item--selected");
			pixelEditor.setSelectedOpcode(parseInt(opcode.code));
		});

		row.appendChild(item);
	}

	categoryDiv.appendChild(row);
	palette.appendChild(categoryDiv);
}

if (firstItem) {
	firstItem.classList.add("editor__palette-item--selected");
	pixelEditor.setSelectedOpcode(parseInt(firstItem.dataset.code));
}

function loadImageFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = reader.result;
		};

		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

fileInput.addEventListener("change", async (e) => {
	const file = e.target.files[0];
	if (!file) return;

	try {
		const img = await loadImageFile(file);
		pixelEditor.loadImage(img);
	} catch (err) {
		console.error(`Failed to load file: ${err}`);
	}
});

function exportProgram(opcodeGrid, dataGrid, originalImageData) {
	const bytecode = encodeBytecode(opcodeGrid, dataGrid);
	const width = opcodeGrid[0].length;
	const height = opcodeGrid.length;

	const imageData = encodeImage(bytecode, width, height, originalImageData);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	ctx.putImageData(imageData, 0, 0);

	const link = document.createElement("a");
	link.download = "program.png";
	link.href = canvas.toDataURL();
	link.click();
}

exportBtn.addEventListener("click", () => {
	const opcodeGrid = pixelEditor.getOpcodeGrid();
	const dataGrid = pixelEditor.getDataGrid();

	if (opcodeGrid === null) {
		alert("Cannot export program with no operations.");
		return;
	}

	exportProgram(opcodeGrid, dataGrid, pixelEditor.imageData);
});

runBtn.addEventListener("click", () => {
	const opcodeGrid = pixelEditor.getOpcodeGrid();
	const dataGrid = pixelEditor.getDataGrid();

	if (!opcodeGrid) {
		alert("Cannot run program with no operations.");
		return;
	}

	const bytecode = encodeBytecode(opcodeGrid, dataGrid);
	const width = opcodeGrid[0].length;
	const height = opcodeGrid.length;

	// Encode bytecode into image
	const imageData = encodeImage(bytecode, width, height, pixelEditor.imageData);

	// Create temp canvas to extract from
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	ctx.putImageData(imageData, 0, 0);

	// Extract bytes
	const extractedBytes = extractBytes(canvas, ctx);

	// Run program
	const interpreter = new Interpreter((output) => {
		outputPre.textContent += output + "\n";
	});
	outputPre.textContent = ""; // clear previous output
	interpreter.run(extractedBytes);
});
