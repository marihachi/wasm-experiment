import { promises as fs } from 'fs';
import path from 'path';
import { Wat2Wasm } from '../wat2wasm';

type TypeName = string;
type ParamInfo = { type: TypeName };

class Func {
	name?: string;
	paramInfos: ParamInfo[] = [];
	resultType?: TypeName;
	bodyItems: string[] = [];

	constructor() {
	}

	generate() {
		const headerItems: string[] = [];
		if (this.name) {
			headerItems.push(`$${ this.name }`);
		}
		const paramItems = this.paramInfos.map(info => {
			const items: string[] = [];
			items.push(info.type);
			return `(param ${ items.join(' ') })`;
		});
		headerItems.push(paramItems.join(' '));
		if (this.resultType) {
			headerItems.push(`(result ${ this.resultType })`);
		}

		return `(func ${ headerItems.join(' ') } ${ this.bodyItems.join(' ') })`;
	}
}

function genFuncImport(moduleName: string, externalName: string, internalName: string) {
	return `(import "${ moduleName }" "${ externalName }" (func $${ internalName }))`;
}

function genFuncExport(externalName: string, internalName: string) {
	return `(export "${ externalName }" (func $${ internalName }))`;
}

function genCall(name: string) {
	return `call $${name}`;
}

function genModule(items: string[]) {
	return `(module ${ items.join(' ') })\n`;
}

async function entry() {

	const moduleItems: string[] = [];

	// import a function from js
	moduleItems.push(genFuncImport('basic', 'fn', 'f'));

	// function
	const func = new Func();

	// function: set signature
	func.name = 'run';
	func.paramInfos.push(...[
		{ type: 'i32' },
		{ type: 'i32' },
	]);
	func.resultType = 'i32';

	// function: set statements
	func.bodyItems.push(...[
		genCall('f')
	]);
	func.bodyItems.push('i32.const 1');
	func.bodyItems.push('return');

	// function: generate
	moduleItems.push(func.generate());

	// export the run function
	moduleItems.push(genFuncExport('run', 'run'));

	const wat = genModule(moduleItems);

	const wat2Wasm = await Wat2Wasm.new();
	const wasm = wat2Wasm.generate(wat);

	// write .wat file
	await fs.writeFile(path.resolve(__dirname, './basic.wat'), wat);

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
		//console.log('run:', instance.exports.run(1, 2));
		console.log('run:', instance.exports.run());
	}
}

entry()
.catch(e => {
	console.log(e);
});
