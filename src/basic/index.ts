import { promises as fs } from 'fs';
import path from 'path';
import IR from 'binaryen';

async function entry() {

	const ir = new IR.Module();

	ir.addFunctionImport('fn', 'basic', 'fn', IR.createType([]), IR.none);
	const blockRef = ir.block(`run.children`, [
		ir.call('fn', [], IR.none),
		ir.local.set(2, ir.i32.add(ir.local.get(0, IR.i32), ir.local.get(1, IR.i32))),
		ir.return(ir.local.get(2, IR.i32))
	]);
	ir.addFunction('run', IR.createType([IR.i32, IR.i32]), IR.i32, [IR.i32], blockRef);
	ir.addFunctionExport('run', 'run');

	if (!ir.validate()) {
		throw new Error('validation error');
	}

	ir.optimize();

	// wat
	const wat = ir.emitText();
	await fs.writeFile(path.resolve(__dirname, './basic.wat'), wat);

	// wasm
	const wasm = ir.emitBinary();
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
