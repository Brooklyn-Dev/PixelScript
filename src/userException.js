import toHexString from "./utils/index.js";

export default class UserException {
	static DivisionByZero = 0x01;

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
		return this.#codeToName.get(code) ?? "UNKNOWN_EXCEPTION";
	}

	static getCode(name) {
		return toHexString(this.#nameToCode.get(name)) ?? null;
	}
}
