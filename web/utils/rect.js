export default class Rect {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.w;
		yield this.h;
	}

	get width() {
		return this.w;
	}

	get height() {
		return this.h;
	}

	clone() {
		return new Rect(...this);
	}
}
