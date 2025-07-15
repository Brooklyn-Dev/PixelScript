import OpcodeMap from "./opcodeMap.js";
import Stack from "./stack.js";
import toHexString from "./utils/index.js";

export default class InterpreterError extends Error {
	/**
	 * @param {Stack} stack
	 * @param {number} opcode
	 * @param {number} pc
	 * @param {InterpreterErrorType} type
	 */
	constructor(stack, opcode, pc, type) {
		const message = `InterpreterError: ${type} during ${OpcodeMap.getName(opcode)} (${toHexString(
			opcode
		)}) operation at pc=${pc}\n\t${stack}`;

		super(message);
	}
}

/**
 * @enum {string}
 */
export const InterpreterErrorType = Object.freeze({
	StackUnderflow: "StackUnderflow",
	MissingOperand: "MissingOperand",
});
