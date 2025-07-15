import toHexString from "./utils/index.js";

export default class OpcodeMap {
	static nameToCode = {
		PUSH: 0x01,
		POP: 0x02,
		DUP: 0x03,
		ADD: 0x10,
		SUB: 0x11,
		HALT: 0x32,
		PRINT: 0x60,
	};

	static codeToName = Object.fromEntries(Object.entries(this.nameToCode).map(([k, v]) => [v, k]));

	static getName(code) {
		return this.codeToName[code] ?? "UNKNOWN";
	}

	static getCode(name) {
		return toHexString(this.nameToCode[name]) ?? null;
	}
}
