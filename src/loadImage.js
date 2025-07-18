import fs from "fs";
import { PNG } from "pngjs";

/**
 * @param {string} path
 * @returns {Promise<Uint8Array>}
 */
export function loadImage(path) {
	return new Promise((resolve, reject) => {
		fs.createReadStream(path)
			.pipe(new PNG({ filterType: 0 }))
			.on("parsed", function () {
				resolve(this.data);
			})
			.on("error", reject);
	});
}
