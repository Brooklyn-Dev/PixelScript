import PixelEditor from "./editor";

const fileInput = document.querySelector(".editor__toolbar-file-input");
const canvas = document.querySelector(".editor__canvas");
const canvasOverlay = document.querySelector(".editor__canvas-overlay");

const pixelEditor = new PixelEditor(canvas, canvasOverlay);

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
