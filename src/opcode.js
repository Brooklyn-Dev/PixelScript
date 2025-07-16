import toHexString from "./utils/index.js";

export default class Opcode {
	static PUSH = 0x01;
	static POP = 0x02;
	static DUP = 0x03;
	static ADD = 0x10;
	static SUB = 0x11;
	static MUL = 0x12;
	static DIV = 0x13;
	static MOD = 0x14;
	static EXP = 0x15;
	static HALT = 0x32;
	static STORE = 0x40;
	static LOAD = 0x41;
	static CALL = 0x50;
	static RETURN = 0x51;
	static FUNC = 0x52;
	static PRINT_NUM = 0x60;
	static PRINT_CHAR = 0x61;
	static PRINTLN_NUM = 0x62;
	static PRINTLN_CHAR = 0x63;
	static TRY = 0x70;
	static CATCH = 0x71;
	static END_TRY = 0x72;

	static #codeToName = new Map();
	static #nameToCode = new Map();

	static {
		for (const [key, value] of Object.entries(this)) {
			if (typeof value === "number") {
				this.#codeToName.set(value, key);
				this.#nameToCode.set(key, value);
			}
		}
	}

	static getName(code) {
		return this.#codeToName.get(code) ?? "UNKNOWN_OPCODE";
	}

	static getCode(name) {
		return toHexString(this.#nameToCode.get(name)) ?? null;
	}
}
