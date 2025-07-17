/**
 * @param {Uint8Array} bytecode
 * @param {number} width
 * @param {number} height
 * @param {ImageData} originalImageData
 * @returns {ImageData}
 */
export default function encodeImage(bytecode, width, height, originalImageData) {
	if (bytecode.length !== width * height) {
		throw new Error("Bytecode size does not match image dimensions.");
	}

	if (originalImageData.width !== width || originalImageData.height !== height) {
		throw new Error("Original image data size mismatch.");
	}

	const original = originalImageData.data;
	const encoded = new Uint8ClampedArray(original.length);

	for (let i = 0; i < original.length; i++) {
		encoded[i] = original[i] & 0b11111100;
	}

	for (let i = 0; i < bytecode.length; i++) {
		const byte = bytecode[i] !== null ? bytecode[i] : 0;
		const offset = i * 4;

		const rLSB = (byte >> 6) & 0b11;
		const gLSB = (byte >> 4) & 0b11;
		const bLSB = (byte >> 2) & 0b11;
		const aLSB = byte & 0b11;

		encoded[offset] |= rLSB;
		encoded[offset + 1] |= gLSB;
		encoded[offset + 2] |= bLSB;
		encoded[offset + 3] |= aLSB;
	}

	return new ImageData(encoded, width, height);
}
