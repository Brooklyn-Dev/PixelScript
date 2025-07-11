export function extractBytes(canvas, ctx) {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const pixels = imageData.data;
	const bytes = [];

	for (let i = 0; i < pixels.length; i += 4) {
		const r = pixels[i];
		const g = pixels[i + 1];
		const b = pixels[i + 2];
		const a = pixels[i + 3];

		const byte = ((r & 0b11) << 6) | ((g & 0b11) << 4) | ((b & 0b11) << 2) | (a & 0b11);
		bytes.push(byte);
	}

	return bytes;
}
