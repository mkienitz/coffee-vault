import { compile, CutBehavior, Media } from '../../../bql/pkg';
import { toDataURL } from 'qrcode';
import { env } from '$env/dynamic/private';
import net from 'net';

export async function printQRCodes(tokens: string[]) {
	const printData = await Promise.all(
		tokens.map(async (token, i) => {
			const dataURL = await toDataURL(`https://${env.COFFEE_VAULT_DOMAIN}/doses/${token}`, {
				width: 236
			});
			const b64 = dataURL.split(',')[1];
			const data = Buffer.from(b64, 'base64');
			const cutBehavior = i == tokens.length - 1 ? CutBehavior.CutAtEnd : CutBehavior.None;
			return compile(data, 1, Media.D24, false, false, true, cutBehavior);
		})
	);
	// Merge all print data to send it out all at once
	const totalSize = printData.reduce((acc, e) => acc + e.length, 0);
	const combined = new Uint8Array(totalSize);
	let insertPos = 0;
	for (const d of printData) {
		combined.set(d, insertPos);
		insertPos += d.length;
	}
	const host = env.COFFEE_VAULT_PRINTER_ADDRESS;
	const port = Number(env.COFFEE_VAULT_PRINTER_PORT);
	const client = net.createConnection({ port, host });
	client.write(combined, (err) => {
		// TODO handle error
		if (err) {
			console.error(`Error while printing: ${err.message}`);
		} else {
			console.log(`Successfully printed ${tokens.length} labels`);
		}
	});
	client.end();
}
