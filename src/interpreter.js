import InterpreterError, { InterpreterErrorType } from "./interpreterError.js";
import Stack from "./stack.js";
import UserException from "./userException.js";

export default class Interpreter {
	#stack = new Stack();
	#bytecode = [];
	#pc = 0;
	running = false;

	#variables = new Array(256).fill(undefined);

	#functions = new Array(256).fill(undefined);
	#callStack = new Stack();

	#exceptionStack = new Stack();
	#handlingException = false;

	constructor() {}

	/** @param {number} bytecode */
	run(bytecode) {
		this.#stack.clear();
		this.#bytecode = bytecode;
		this.#pc = 0;
		this.running = true;

		this.#variables.fill(undefined);

		this.#functions.fill(undefined);
		this.#callStack.clear();

		this.#exceptionStack.clear();
		this.#handlingException = false;

		try {
			while (this.running && this.#pc < this.#bytecode.length) {
				const opcode = this.#bytecode.at(this.#pc);
				this.#executeInstruction(opcode);
				this.#pc++;
			}
		} catch (err) {
			if (err instanceof InterpreterError) {
				console.error(err.message);
			} else {
				throw err;
			}
		}
	}

	/**
	 * @param {number} opcode
	 * @returns {number}
	 */
	#safePop(opcode) {
		if (this.#stack.isEmpty()) {
			throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.StackUnderflow);
		}
		return this.#stack.pop();
	}

	/**
	 * @param {number} opcode
	 * @returns {number}
	 */
	#safePeek(opcode) {
		if (this.#stack.isEmpty()) {
			throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.StackUnderflow);
		}
		return this.#stack.peek();
	}

	/**
	 * @param {number} opcode
	 * @returns {number}
	 */
	#nextOperand(opcode) {
		this.#pc++;
		if (this.#pc >= this.#bytecode.length) {
			throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingOperand);
		}
		return this.#bytecode.at(this.#pc);
	}

	/**
	 * @param {number} opcode
	 * @returns {number}
	 */
	#findNextCatch(opcode) {
		let depth = 0;
		let searchPc = this.#pc + 1;

		while (searchPc < this.#bytecode.length) {
			const opcode = this.#bytecode.at(searchPc);

			if (opcode === 0x70) depth++;
			if (opcode === 0x71 && depth === 0) return searchPc;
			if (opcode === 0x72) {
				if (depth === 0)
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingCatch);
				depth--;
			}

			searchPc++;
		}

		throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingCatch);
	}

	/**
	 * @param {number} opcode
	 * @returns {number}
	 */
	#findNextCatchOrEndTry(opcode) {
		let depth = 0;
		let searchPc = this.#pc + 1;

		while (searchPc < this.#bytecode.length) {
			const opcode = this.#bytecode.at(searchPc);

			if (opcode === 0x70) depth++;
			if ((opcode === 0x71 || opcode === 0x72) && depth === 0) return searchPc;
			if (opcode === 0x72) depth--;

			searchPc++;
		}

		throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingCatchOrEndTry);
	}

	/**
	 * @param {number} startAddress
	 * @param {number} exceptionType
	 * @returns {number | null}
	 */
	#findMatchingCatch(startAddress, exceptionType) {
		let depth = 0;
		let searchPc = startAddress;

		while (searchPc < this.#bytecode.length) {
			const opcode = this.#bytecode.at(searchPc);

			if (opcode === 0x70) depth++;
			if (opcode === 0x71 && depth === 0) {
				const typeCount = this.#bytecode.at(searchPc + 1);
				if (typeCount === 0) {
					return searchPc;
				}

				for (let i = 0; i < typeCount; i++) {
					const type = this.#bytecode.at(searchPc + 2 + i);
					if (type === exceptionType) {
						return searchPc;
					}
				}
			}
			if (opcode === 0x72) {
				if (depth === 0) return null;
				depth--;
			}

			searchPc++;
		}

		return null;
	}

	/**
	 * @param {number} opcode
	 * @param {number} exceptionType
	 */
	#throwUserException(opcode, exceptionType) {
		while (!this.#exceptionStack.isEmpty()) {
			const handler = this.#exceptionStack.peek();

			const matchingCatch = handler.catchAll
				? this.#findNextCatch(opcode)
				: this.#findMatchingCatch(handler.address, exceptionType);

			if (matchingCatch) {
				while (this.#stack.size() > handler.stackSize) {
					this.#stack.pop();
				}

				this.#pc = matchingCatch - 1;
				this.#handlingException = true;
				return;
			}

			this.#exceptionStack.pop();
		}

		throw new InterpreterError(
			this.#stack,
			opcode,
			this.#pc,
			InterpreterErrorType.UnhandledException,
			exceptionType
		);
	}

	/** @param {number} opcode */
	#executeInstruction(opcode) {
		switch (opcode) {
			// Stack
			case 0x01: {
				// PUSH <value>
				const operand = this.#nextOperand(opcode);
				this.#stack.push(operand);
				break;
			}

			case 0x02: {
				// POP
				this.#safePop(opcode);
				break;
			}

			case 0x03: {
				// DUP
				const top = this.#safePeek(opcode);
				this.#stack.push(top);
				break;
			}

			// Arithmetic
			case 0x10: {
				// ADD
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				this.#stack.push(a + b);
				break;
			}

			case 0x11: {
				// SUB
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				this.#stack.push(b - a);
				break;
			}

			case 0x12: {
				// MUL
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				this.#stack.push(a * b);
				break;
			}

			case 0x13: {
				// DIV
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				if (a === 0) {
					this.#throwUserException(opcode, UserException.DivisionByZero);
					return;
				}
				this.#stack.push(b / a);
				break;
			}

			case 0x14: {
				// MOD
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				if (a === 0) {
					this.#throwUserException(opcode, UserException.DivisionByZero);
					return;
				}
				this.#stack.push(b % a);
				break;
			}

			case 0x15: {
				// EXP
				const a = this.#safePop(opcode);
				const b = this.#safePop(opcode);
				this.#stack.push(Math.pow(b, a));
				break;
			}

			// Control
			case 0x32: {
				// HALT
				this.running = false;
				break;
			}

			// Variables
			case 0x40: {
				// STORE <id>
				const id = this.#nextOperand(opcode);
				const value = this.#safePop();
				this.#variables[id] = value;
				break;
			}

			case 0x41: {
				// LOAD <id>
				const id = this.#nextOperand(opcode);

				if (this.#variables.at(id) === undefined) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.UndefinedVariable);
				}
				const value = this.#variables.at(id);

				this.#stack.push(value);
				break;
			}

			// Functions
			case 0x50: {
				// CALL <func-id>
				const funcId = this.#nextOperand(opcode);
				if (this.#functions.at(funcId) === undefined) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.UndefinedFunction);
				}

				this.#callStack.push(this.#pc + 1);
				this.#pc = this.#functions.at(funcId);
				break;
			}

			case 0x51: {
				// RETURN
				if (this.#callStack.length === 0) {
					this.running = false;
					return;
				}
				this.#pc = this.#callStack.pop() - 1;
				break;
			}

			case 0x52: {
				// FUNC <func-id>
				const funcId = this.#nextOperand(opcode);
				this.#functions[funcId] = this.#pc;

				while (this.#bytecode.at(this.#pc) !== 0x51 && this.#pc < this.#bytecode.length) {
					this.#pc++;
				}

				if (this.#pc >= this.#bytecode.length) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingReturn);
				}

				break;
			}

			// I/O
			case 0x60: {
				// PRINT_NUM
				const num = this.#safePop(opcode);
				process.stdout.write(num.toString());
				break;
			}

			case 0x61: {
				// PRINT_CHAR
				const num = this.#safePop(opcode);
				const ascii = String.fromCharCode(num);
				process.stdout.write(ascii);
				break;
			}

			case 0x62: {
				// PRINTLN_NUM
				const num = this.#safePop(opcode);
				process.stdout.write(num.toString() + "\n");
				break;
			}

			case 0x63: {
				// PRINTLN_CHAR
				const num = this.#safePop(opcode);
				const ascii = String.fromCharCode(num);
				process.stdout.write(ascii + "\n");
				break;
			}

			// Exception Handling
			case 0x70: {
				// TRY
				this.#exceptionStack.push({
					address: this.#findNextCatch(opcode),
					stackSize: this.#stack.size(),
					types: [],
				});
				break;
			}

			case 0x71: {
				// CATCH <type-count> <type1> ...
				if (this.#exceptionStack.isEmpty()) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MisplacedCatch);
				}

				const typeCount = this.#nextOperand(opcode);
				const types = [];

				for (let i = 0; i < typeCount; i++) {
					types.push(this.#nextOperand(opcode));
				}

				const handler = this.#exceptionStack.pop();
				handler.types = types;
				this.#exceptionStack.push(handler);

				if (!this.#handlingException) {
					this.#pc = this.#findNextCatchOrEndTry(opcode) - 1;
				}

				break;
			}

			case 0x72: {
				// END_TRY
				this.#exceptionStack.pop();
				this.#handlingException = false;
				break;
			}

			default:
				break;
		}
	}
}
