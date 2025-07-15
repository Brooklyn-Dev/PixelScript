import toHexString from "./utils/index.js";

export default class OpcodeMap {
	static nameToCode = {
		PUSH: 0x01,
		POP: 0x02,
		DUP: 0x03,
		ADD: 0x10,
		SUB: 0x11,
		HALT: 0x32,
		STORE: 0x40,
		LOAD: 0x41,
		PRINT_NUM: 0x60,
		PRINT_CHAR: 0x61,
		PRINTLN_NUM: 0x62,
		PRINTLN_CHAR: 0x63,
	};

	static codeToName = Object.fromEntries(Object.entries(this.nameToCode).map(([k, v]) => [v, k]));

	static getName(code) {
		return this.codeToName[code] ?? "UNKNOWN";
	}

	static getCode(name) {
		return toHexString(this.nameToCode[name]) ?? null;
	}
}
