/**
 * @param {ImageData} imageData
 * @param {Number} x
 * @param {Number} y
 * @returns {Uint8ClampedArray | null} [R, G, B, A]
 */
export function getPixelFromImageData(imageData, x, y) {
	if (!imageData) return null;
	if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) return null;

	let i = (y * imageData.width + x) * 4;
	return imageData.data.slice(i, i + 4);
}

/**
 * @param {Uint8ClampedArray} rgb
 * @returns {Number} brightness (0-255)
 */
export function getPixelBrightness([r, g, b]) {
	if (r === undefined || g === undefined || b === undefined) return 256;
	return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}
