import Opcode from "./opcode.js";
import Stack from "./stack.js";
import UserException from "./userException.js";
import toHexString from "./utils/index.js";

export default class InterpreterError extends Error {
	/**
	 * @param {Stack} stack
	 * @param {number} opcode
	 * @param {number} pc
	 * @param {InterpreterErrorType} type
	 * @param {number} [userExceptionType=null]
	 */
	constructor(stack, opcode, pc, type, userExceptionType = null) {
		let userExceptionMessage = "";
		if (userExceptionType !== null) {
			userExceptionMessage = ` (${UserException.getName(userExceptionType)})`;
		}

		const message = `InterpreterError: ${type}${userExceptionMessage} during ${Opcode.getName(
			opcode
		)} (${toHexString(opcode)}) operation at pc=${pc}\n\t${stack}`;

		super(message);
	}
}

/**
 * @enum {string}
 */
export const InterpreterErrorType = Object.freeze({
	MisplacedCatch: "MisplacedCatch",
	MissingCatch: "MissingCatch",
	MissingCatchOrEndTry: "MissingCatchOrEndTry",
	MissingEndTry: "MissingEndTry",
	MissingOperand: "MissingOperand",
	MissingReturn: "MissingReturn",
	StackUnderflow: "StackUnderflow",
	UnhandledException: "UnhandledException",
	UndefinedFunction: "UndefinedFunction",
	UndefinedVariable: "UndefinedVariable",
});
