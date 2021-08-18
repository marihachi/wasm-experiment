import Wabt from 'wabt';

type PromiseResult<T extends Promise<any>> =
	T extends Promise<infer R> ? R : never;

export class Wat2Wasm {
	private wabt: PromiseResult<ReturnType<typeof Wabt>>;

	constructor(wabt: Wat2Wasm['wabt']) {
		this.wabt = wabt;
	}

	public generate(buffer: Uint8Array | string): Uint8Array {
		const wasmModule = this.wabt.parseWat('a.wat', buffer);
		wasmModule.validate();
		const result = wasmModule.toBinary({ });
		return result.buffer;
	}

	public static async new(): Promise<Wat2Wasm> {
		return new Wat2Wasm(await Wabt());
	}
}
