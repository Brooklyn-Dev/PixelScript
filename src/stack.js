export default class Stack {
	#items = [];

	push(item) {
		this.#items.push(item);
	}

	pop() {
		return this.#items.pop();
	}

	peek() {
		return this.#items.at(-1);
	}

	isEmpty() {
		return this.#items.length === 0;
	}

	size() {
		return this.#items.length;
	}
}
