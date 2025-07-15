import InterpreterError, { InterpreterErrorType } from "./errors.js";
import Stack from "./stack.js";

export default class Interpreter {
	#stack = new Stack();
	#bytecode = [];
	#pc = 0;
	running = false;

	#variables = new Array(256).fill(undefined);

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

			// Variables
			case 0x40: {
				// STORE
				this.#pc++;

				if (this.#pc >= this.#bytecode.length) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingOperand);
				}
				const id = this.#bytecode.at(this.#pc);

				const value = this.#safePop();
				this.#variables[id] = value;
				break;
			}

			case 0x41: {
				// LOAD
				this.#pc++;

				if (this.#pc >= this.#bytecode.length) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.MissingOperand);
				}
				const id = this.#bytecode.at(this.#pc);

				if (this.#variables.at(id) === undefined) {
					throw new InterpreterError(this.#stack, opcode, this.#pc, InterpreterErrorType.UndefinedVariable);
				}
				const value = this.#variables.at(id);

				this.#stack.push(value);
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

			default:
				break;
		}
	}
}
