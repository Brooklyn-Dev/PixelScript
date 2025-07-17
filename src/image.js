import fs from "fs";
import { PNG } from "pngjs";

/**
 * @param {string} path
 * @returns {Promise<Uint8Array>}
 */
export function loadImage(path) {
	return new Promise((resolve, reject) => {
		fs.createReadStream(path)
			.pipe(new PNG())
			.on("parsed", function () {
				resolve(this.data);
			})
			.on("error", reject);
	});
}

/**
 * @param {Uint8Array} data
 * @returns {number[]}
 */
export function extractBytes(data) {
	const bytes = [];

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];

		const byte = ((r & 0b11) << 6) | ((g & 0b11) << 4) | ((b & 0b11) << 2) | (a & 0b11);
		bytes.push(byte);
	}

	return bytes;
}
