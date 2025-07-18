import Opcode from "./opcode.js";

for (const [key, value] of Object.entries(Opcode)) {
	if (typeof value === "number") {
		globalThis[key] = value;
	}
}
