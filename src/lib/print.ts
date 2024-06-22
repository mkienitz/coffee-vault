export function printQRCodes(tokens: string[]) {
	const toks = tokens.map((t) => `\t${t}`).join('\n');
	console.log(`Printing ${tokens.length} codes:\n${toks}`);
}
