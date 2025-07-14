import Rect from "./rect";

export default class PixelEditor {
	/** @type {HTMLCanvasElement} */
	#canvas = null;

	/** @type {CanvasRenderingContext2D} */
	#ctx = null;

	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas) {
		this.#canvas = canvas;
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
	}

	/** @param {MouseEvent} e */
	#getMousePos(e) {
		const rect = this.#canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	#setupEventListeners() {
		window.addEventListener("resize", () => {
			this.#updateCanvasSize();
			this.render();
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

			this.render();
		});

		this.#canvas.addEventListener("mousedown", (e) => {
			if (e.button !== 1) return;

			this.isDragging = true;
			this.lastMouse = this.#getMousePos(e);
		});

		this.#canvas.addEventListener("mousemove", (e) => {
			if (!this.isDragging) return;

			const { x: mx, y: my } = this.#getMousePos(e);
			const dx = mx - this.lastMouse.x;
			const dy = my - this.lastMouse.y;

			this.viewport.x += dx;
			this.viewport.y += dy;

			this.lastMouse = this.#getMousePos(e);

			this.render();
		});

		this.#canvas.addEventListener("mouseup", (e) => {
			if (e.button !== 1) return;

			this.isDragging = false;
		});
	}

	/** @param {HTMLImageElement} img */
	loadImage(img) {
		this.image = img;

		this.#ctx.drawImage(img, 0, 0);
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

		this.render();
	}

	render() {
		if (!this.viewport) return;

		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		this.#ctx.drawImage(this.image, ...this.viewport);
	}
}
