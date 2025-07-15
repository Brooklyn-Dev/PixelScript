import InterpreterError, { InterpreterErrorType } from "./errors.js";
import Stack from "./stack.js";

export default class Interpreter {
	#stack = new Stack();
	#bytecode = [];
	#pc = 0;
	running = false;

	constructor() {}

	run(bytecode) {
		this.#stack.clear();
		this.#bytecode = bytecode;
		this.#pc = 0;
		this.running = true;

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

	#safePop(opcode) {
		if (this.#stack.isEmpty()) {
			throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.StackUnderflow);
		}
		return this.#stack.pop();
	}

	#safePeek(opcode) {
		if (this.#stack.isEmpty()) {
			throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.StackUnderflow);
		}
		return this.#stack.peek();
	}

	#executeInstruction(opcode) {
		switch (opcode) {
			// Stack
			case 0x01: {
				// PUSH
				this.#pc++;

				if (this.#pc >= this.#bytecode.length) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingOperand);
				}

				const operand = this.#bytecode.at(this.#pc);
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

			// Control
			case 0x32: {
				// HALT
				this.running = false;
				break;
			}

			// I/O
			case 0x60: {
				// PRINT
				const output = this.#safePop(opcode);
				console.log(output);
				break;
			}

			default:
				break;
		}
	}
}
