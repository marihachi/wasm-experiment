import { promises as fs } from 'fs';
import path from 'path';
import { Wat2Wasm } from '../wat2wasm';

async function entry() {

	// load .wat file
	const wat = await fs.readFile(path.resolve(__dirname, '../../src/basic/basic.wat'));

	const wat2Wasm = await Wat2Wasm.new();
	const wasm = wat2Wasm.generate(wat);

	// write .wasm file
	await fs.writeFile(path.resolve(__dirname, './basic.wasm'), wasm);

	// imported data
	const importObject: WebAssembly.Imports = {
		basic: {
			fn: () => {
				console.log('fn called');
			}
		}
	};

	// load wasm
	const { module, instance } = await WebAssembly.instantiate(wasm, importObject);

	// call exported function
	if (typeof instance.exports.run == 'function') {
		console.log('run:', instance.exports.run(1, 2));
	}
}

entry()
.catch(e => {
	console.log(e);
});
