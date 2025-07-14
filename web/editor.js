import { getPixelFromImageData, getPixelBrightness } from "./utils/image";
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
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {{x: number, y: number}}
	 */
	#getMousePos(e) {
		const rect = this.#canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	#clearOverlay() {
		this.#ctxOverlay.clearRect(0, 0, this.#canvasOverlay.width, this.#canvasOverlay.height);
	}

	/** @param {MouseEvent} e */
	#updateOverlay(e) {
		if (!this.image) return;

		const { x: mx, y: my } = this.#getMousePos(e);

		if (
			mx < this.viewport.x ||
			mx > this.viewport.x + this.viewport.w ||
			my < this.viewport.y ||
			my > this.viewport.y + this.viewport.h
		) {
			this.#clearOverlay();
			return;
		}

		const col = Math.floor((mx - this.viewport.x) / this.zoom);
		const row = Math.floor((my - this.viewport.y) / this.zoom);

		const x = col * this.zoom + this.viewport.x;
		const y = row * this.zoom + this.viewport.y;

		const pixel = getPixelFromImageData(this.imageData, col, row);
		const pixelBrightness = getPixelBrightness(pixel);
		const colour = pixelBrightness >= 128 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";

		this.renderOverlay(x, y, colour);
	}

	#setupEventListeners() {
		window.addEventListener("resize", () => {
			this.#updateCanvasSize();
			this.#renderCanvas();
		});

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

			this.#renderCanvas();
			this.#updateOverlay(e);
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

			this.#updateOverlay(e);
		});

		this.#canvas.addEventListener("mouseup", (e) => {
			if (e.button !== 1) return;

			this.isDragging = false;
		});

		this.#canvas.addEventListener("mousemove", this.#updateOverlay);
	}

	/** @param {HTMLImageElement} img */
	loadImage(img) {
		this.image = img;

		this.#ctx.drawImage(img, 0, 0);
		console.log(img.width, img.height);
		this.imageData = this.#ctx.getImageData(0, 0, img.width, img.height);

		const scaleX = this.#canvas.width / img.width;
		const scaleY = this.#canvas.height / img.height;

		this.zoom = Math.min(scaleX, scaleY);

		const offsetX = this.image.width * this.zoom;
		const offsetY = this.image.height * this.zoom;

		this.viewport = new Rect(
			(this.#canvas.width - offsetX) / 2,
			(this.#canvas.height - offsetY) / 2,
			offsetX,
			offsetY
		);

		this.#updateCanvasSize();
		this.#renderCanvas();
	}

	#renderCanvas() {
		if (!this.viewport) return;

		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		this.#ctx.drawImage(this.image, ...this.viewport);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} colour
	 */
	renderOverlay(x, y, colour) {
		this.#ctxOverlay.clearRect(0, 0, this.#canvasOverlay.width, this.#canvasOverlay.height);
		this.#ctxOverlay.fillStyle = colour;
		this.#ctxOverlay.fillRect(x, y, this.zoom, this.zoom);
	}
}
