/**
 * @param {Array<Array<number>>} opcodeGrid
 * @param {Array<Array<number>>} dataGrid
 * @returns {Uint8Array}
 */
export default function encodeBytecode(opcodeGrid, dataGrid) {
	const height = opcodeGrid.length;
	const width = opcodeGrid[0].length;

	const bytecode = [];

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const opcode = opcodeGrid[row][col];
			const data = dataGrid[row][col];

			if (opcode !== 0 && data !== null) {
				throw new Error(`Pixel [${row}, ${col}] has both opcode and data.`);
			}

			const value = opcode !== 0 ? opcode : data;
			bytecode.push(value);
		}
	}

	return new Uint8Array(bytecode);
}
