import PixelEditor from "./editor";
import { OPCODE_CATEGORIES, OPCODES } from "./utils/opcodes";

const fileInput = document.querySelector(".editor__toolbar-file-input");
const canvas = document.querySelector(".editor__canvas");
const canvasOverlay = document.querySelector(".editor__canvas-overlay");
const palette = document.querySelector(".editor__palette");

const pixelEditor = new PixelEditor(canvas, canvasOverlay);

// Categorise opcodes
const categories = {};
for (const opcode of OPCODES) {
	const category = parseInt(opcode.code) & 0xf0;
	if (!categories[category]) {
		categories[category] = [];
	}
	categories[category].push(opcode);
}

console.log(categories);
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
