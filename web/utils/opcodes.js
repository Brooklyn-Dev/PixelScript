export const OPCODES = [
	{ code: "0x01", name: "PUSH", colour: "#ff69b4" },
	{ code: "0x02", name: "POP", colour: "#e91e63" },
	{ code: "0x03", name: "DUP", colour: "#c2185b" },
	{ code: "0x04", name: "SWAP", colour: "#880e4f" },

	{ code: "0x10", name: "ADD", colour: "#2196f3" },
	{ code: "0x11", name: "SUB", colour: "#1976d2" },
	{ code: "0x12", name: "MUL", colour: "#1565c0" },
	{ code: "0x13", name: "DIV", colour: "#0d47a1" },
	{ code: "0x14", name: "MOD", colour: "#0a3d91" },
	{ code: "0x15", name: "EXP", colour: "#073381" },

	{ code: "0x20", name: "EQ", colour: "#4caf50" },
	{ code: "0x21", name: "NEQ", colour: "#388e3c" },
	{ code: "0x22", name: "GT", colour: "#2e7d32" },
	{ code: "0x23", name: "LT", colour: "#1b5e20" },

	{ code: "0x30", name: "HALT", colour: "#757575" },

	{ code: "0x40", name: "STORE", colour: "#ff9800" },
	{ code: "0x41", name: "LOAD", colour: "#f57c00" },

	{ code: "0x50", name: "CALL", colour: "#00e5ff" },
	{ code: "0x51", name: "CALLZ", colour: "#00bcd4" },
	{ code: "0x52", name: "CALLNZ", colour: "#0097a7" },
	{ code: "0x53", name: "CALLP", colour: "#00838f" },
	{ code: "0x54", name: "RETURN", colour: "#006064" },
	{ code: "0x55", name: "FUNC", colour: "#004d40" },

	{ code: "0x60", name: "PRINT_NUM", colour: "#90a4ae" },
	{ code: "0x61", name: "PRINT_CHAR", colour: "#78909c" },
	{ code: "0x62", name: "PRINTLN_NUM", colour: "#607d8b" },
	{ code: "0x63", name: "PRINTLN_CHAR", colour: "#455a64" },

	{ code: "0x70", name: "TRY", colour: "#9c27b0" },
	{ code: "0x71", name: "CATCH", colour: "#7b1fa2" },
	{ code: "0x72", name: "END_TRY", colour: "#4a148c" },
];

export const OPCODE_COLOUR_MAP = new Map(OPCODES.map((op) => [parseInt(op.code), op.colour]));

export const OPCODE_CATEGORIES = {
	0x00: "Stack",
	0x10: "Arithmetic",
	0x20: "Logic",
	0x30: "Control",
	0x40: "Variables",
	0x50: "Functions",
	0x60: "I/O",
	0x70: "Exception Handling",
};
