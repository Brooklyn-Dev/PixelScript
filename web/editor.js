import { getPixelFromImageData, getPixelBrightness } from "./utils/image";
import { OPCODE_COLOUR_MAP } from "./utils/opcodes";
import Rect from "./utils/rect";

export default class PixelEditor {
	/** @type {HTMLCanvasElement} */
	#canvas = null;
	/** @type {HTMLCanvasElement} */
	#canvasOverlay = null;

	/** @type {CanvasRenderingContext2D} */
	#ctx = null;
	/** @type {CanvasRenderingContext2D} */
	#ctxOverlay = null;

	/** @type {{ x: number, y: number, colour: string }} */
	#highlightedPixel = null;

	#selectedOpcode = 0x01;
	/** @type {Array<Array<number>>} */
	#opcodeGrid = null;

	/** @type {Array<Array<number>>} */
	#dataGrid = null;

	#mode = "opcode";

	#needsRender = true;

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {HTMLCanvasElement} canvasOverlay
	 */
	constructor(canvas, canvasOverlay) {
		this.#canvas = canvas;
		this.#canvasOverlay = canvasOverlay;
		this.#updateCanvasSize();

		/** @type {HTMLImageElement} */
		this.image = null;

		/** @type {ImageData} */
		this.imageData = null;

		/** @type {Rect} */
		this.viewport = null;
		this.zoom = 1;

		this.lastMouse = null;
		this.isDragging = false;

		this.#setupEventListeners();
		this.#startRenderLoop();
	}

	/** @param {number} opcode*/
	setSelectedOpcode(opcode) {
		this.#selectedOpcode = opcode;
	}

	toggleMode() {
		this.#mode = this.#mode === "opcode" ? "literal" : "opcode";
		this.#needsRender = true;
	}

	#startRenderLoop() {
		const loop = () => {
			if (this.#needsRender) {
				this.#renderCanvas();
				this.#needsRender = false;
			}
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	#updateCanvasSize() {
		const { width: oldWidth, height: oldHeight } = this.#canvas;
		const { width, height } = this.#canvas.getBoundingClientRect();
		this.#canvas.width = width;
		this.#canvas.height = height;

		this.#canvasOverlay.width = width;
		this.#canvasOverlay.height = height;

		if (this.viewport) {
			const centreScreenX = oldWidth / 2;
			const centreScreenY = oldHeight / 2;

			const centreWorldX = (centreScreenX - this.viewport.x) / this.zoom;
			const centreWorldY = (centreScreenY - this.viewport.y) / this.zoom;

			this.viewport.w = this.image.width * this.zoom;
			this.viewport.h = this.image.height * this.zoom;

			const newCentreX = this.#canvas.width / 2;
			const newCentreY = this.#canvas.height / 2;

			this.viewport.x = newCentreX - centreWorldX * this.zoom;
			this.viewport.y = newCentreY - centreWorldY * this.zoom;
		}

		this.#ctx = this.#canvas.getContext("2d");
		this.#ctx.imageSmoothingEnabled = false;
		this.#ctxOverlay = this.#canvasOverlay.getContext("2d");
		this.#ctxOverlay.imageSmoothingEnabled = false;

		this.#needsRender = true;
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {{ x: number, y: number }}
	 */
	#getMousePos(e) {
		const rect = this.#canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {{ col: number, row: number} | null}
	 * */
	#getPixelCoordinates(e) {
		if (!this.image) return null;

		const { x: mx, y: my } = this.#getMousePos(e);

		if (
			mx < this.viewport.x ||
			mx > this.viewport.x + this.viewport.w ||
			my < this.viewport.y ||
			my > this.viewport.y + this.viewport.h
		) {
			return null;
		}

		const col = Math.floor((mx - this.viewport.x) / this.zoom);
		const row = Math.floor((my - this.viewport.y) / this.zoom);

		return { col, row };
	}

	/** @param {MouseEvent} e */
	#updatePixelHighlight(e) {
		const coords = this.#getPixelCoordinates(e);
		if (!coords) {
			this.#highlightedPixel = null;
			return;
		}

		const { col, row } = coords;
		const pixel = getPixelFromImageData(this.imageData, col, row);
		const pixelBrightness = getPixelBrightness(pixel);

		this.#highlightedPixel = {
			x: col * this.zoom + this.viewport.x,
			y: row * this.zoom + this.viewport.y,
			colour: pixelBrightness >= 128 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
		};
	}

	#setupEventListeners() {
		window.addEventListener("resize", () => {
			this.#updateCanvasSize();
		});

		// Scroll
		this.#canvas.addEventListener("wheel", (e) => {
			if (!this.viewport) return;

			const { x: mx, y: my } = this.#getMousePos(e);

			const zoomSF = e.deltaY > 0 ? 0.9 : 1.1;
			const newZoom = this.zoom * zoomSF;

			const offsetX = (mx - this.viewport.x) / this.zoom;
			const offsetY = (my - this.viewport.y) / this.zoom;

			this.zoom = newZoom;

			this.viewport.w = this.image.width * this.zoom;
			this.viewport.h = this.image.height * this.zoom;

			this.viewport.x = mx - offsetX * this.zoom;
			this.viewport.y = my - offsetY * this.zoom;

			this.#needsRender = true;
		});

		this.#canvas.addEventListener("mousedown", (e) => {
			if (e.button !== 1) return;

			this.isDragging = true;
			this.lastMouse = this.#getMousePos(e);
		});

		this.#canvas.addEventListener("mousemove", (e) => {
			if (this.isDragging) {
				const { x: mx, y: my } = this.#getMousePos(e);
				const dx = mx - this.lastMouse.x;
				const dy = my - this.lastMouse.y;

				this.viewport.x += dx;
				this.viewport.y += dy;

				this.lastMouse = { x: mx, y: my };

				this.#renderCanvas();
			}

			this.#updatePixelHighlight(e);
			this.#needsRender = true;
		});

		this.#canvas.addEventListener("mouseup", (e) => {
			if (e.button !== 1) return;

			this.isDragging = false;
		});

		// Left-click
		this.#canvas.addEventListener("click", (e) => {
			const coords = this.#getPixelCoordinates(e);
			if (!coords) return;

			const { col, row } = coords;

			if (this.#mode === "opcode") {
				if (this.#dataGrid[row][col] === 0) {
					this.#opcodeGrid[row][col] = this.#selectedOpcode;
				}
			} else {
				if (this.#opcodeGrid[row][col] === 0) {
					const data = prompt("Enter a value 0-255", "0");
					const val = Number(data);
					if (!isNaN(val) && val >= 0 && val <= 255) {
						this.#dataGrid[row][col] = val;
					} else {
						alert("Invalid value! Must be 0-255.");
					}
				}
			}

			this.#needsRender = true;
		});

		// Right-click
		this.#canvas.addEventListener("contextmenu", (e) => {
			e.preventDefault();

			const coords = this.#getPixelCoordinates(e);
			if (!coords) return;

			const { col, row } = coords;

			if (this.#mode === "opcode") {
				this.#opcodeGrid[row][col] = 0;
			} else {
				this.#dataGrid[row][col] = 0;
			}

			this.#needsRender = true;
		});
	}

	/** @param {HTMLImageElement} img */
	loadImage(img) {
		this.#ctx.drawImage(img, 0, 0);
		this.imageData = this.#ctx.getImageData(0, 0, img.width, img.height);

		const scaleX = this.#canvas.width / img.width;
		const scaleY = this.#canvas.height / img.height;

		this.zoom = Math.min(scaleX, scaleY);

		const offsetX = img.width * this.zoom;
		const offsetY = img.height * this.zoom;

		this.viewport = new Rect(
			(this.#canvas.width - offsetX) / 2,
			(this.#canvas.height - offsetY) / 2,
			offsetX,
			offsetY
		);

		this.image = img;

		this.#updateCanvasSize();

		this.#highlightedPixel = null;
		this.#opcodeGrid = Array.from({ length: img.height }, () => new Array(img.width).fill(0));
		this.#dataGrid = Array.from({ length: img.height }, () => new Array(img.width).fill(0));
	}

	#renderCanvas() {
		if (this.viewport) {
			this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
			this.#ctx.drawImage(this.image, ...this.viewport);
		}

		this.#ctxOverlay.clearRect(0, 0, this.#canvasOverlay.width, this.#canvasOverlay.height);

		this.#renderOpcode();

		if (this.#highlightedPixel) {
			const { x, y, colour } = this.#highlightedPixel;
			this.#ctxOverlay.fillStyle = colour;
			this.#ctxOverlay.fillRect(x, y, this.zoom, this.zoom);
		}
	}

	#renderOpcode() {
		if (!this.#opcodeGrid) return;

		this.#ctxOverlay.strokeStyle = "black";
		this.#ctxOverlay.lineWidth = 1;

		for (let row = 0; row < this.#opcodeGrid.length; row++) {
			for (let col = 0; col < this.#opcodeGrid[row].length; col++) {
				const opcode = this.#opcodeGrid[row][col];
				const data = this.#dataGrid[row][col];

				const x = this.viewport.x + col * this.zoom;
				const y = this.viewport.y + row * this.zoom;

				if (opcode !== 0) {
					this.#ctxOverlay.fillStyle = OPCODE_COLOUR_MAP.get(opcode);
					this.#ctxOverlay.fillRect(x, y, this.zoom, this.zoom);

					this.#ctxOverlay.strokeRect(x + 0.5, y + 0.5, this.zoom - 1, this.zoom - 1);
				} else if (data !== 0) {
					this.#ctxOverlay.fillStyle = "white";
					this.#ctxOverlay.font = `${this.zoom * 0.55}px monospace`;
					this.#ctxOverlay.textAlign = "center";
					this.#ctxOverlay.textBaseline = "middle";
					this.#ctxOverlay.fillText(data, x + this.zoom / 2, y + this.zoom / 2);

					this.#ctxOverlay.strokeRect(x + 0.5, y + 0.5, this.zoom - 1, this.zoom - 1);
				}
			}
		}
	}
}
