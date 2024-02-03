const ivm = require('isolated-vm');
exports.handler = async function (event) {
	try {
		const reqBody = JSON.parse(event.body);
		const binaryData = new Uint8Array(reqBody.code);
		const decoder = new TextDecoder('utf-8');
		const code = decoder.decode(binaryData);

		const capturedLogs = [];
		const isolate = new ivm.Isolate(
			{ memoryLimit: 128 * 1024 * 1024 },
			{ cpuTimeLimit: 10000 },
		);
		const context = await isolate.createContext();

		context.evalClosureSync(
			`
            globalThis.console = {
                log: $0
            }
            `,
			[
				(...args) =>
					capturedLogs.push(...args.map((arg) => JSON.stringify(arg))),
			],
		);

		const script = isolate.compileScriptSync(code);
		const returned = script.runSync(context);

		return {
			statusCode: 200,
			body: JSON.stringify({ returned: returned, logged: capturedLogs }),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: error.message }),
			event,
		};
	}
};
const event =
	'{"code":{"0":99,"1":111,"2":110,"3":115,"4":111,"5":108,"6":101,"7":46,"8":108,"9":111,"10":103,"11":40,"12":39,"13":104,"14":101,"15":108,"16":108,"17":111,"18":32,"19":119,"20":111,"21":114,"22":108,"23":100,"24":39,"25":41,"26":59}}';

const foo = async () => {
	const reqBody = JSON.parse(event);
	const binaryData = new Uint8Array(reqBody.code);
	const decoder = new TextDecoder('utf-8');
	const code = decoder.decode(binaryData);

	console.log(code, reqBody);
	const capturedLogs = [];
	const isolate = new ivm.Isolate(
		{ memoryLimit: 128 * 1024 * 1024 },
		{ cpuTimeLimit: 10000 },
	);
	const context = await isolate.createContext();

	context.evalClosureSync(
		`
            globalThis.console = {
                log: $0
            }
            `,
		[(...args) => capturedLogs.push(...args.map((arg) => JSON.stringify(arg)))],
	);

	const script = isolate.compileScriptSync(code);
	const returned = script.runSync(context);
	console.log(returned, capturedLogs);
	return {
		statusCode: 200,
		body: JSON.stringify({ returned: returned, logged: capturedLogs }),
	};
};
foo();
