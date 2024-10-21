import { toBuffer } from 'qrcode';
import { env } from '$env/dynamic/private';

export async function printQRCodes(tokens: string[]) {
	console.log(`Starting to print ${tokens.length} tokens`);
	tokens.forEach(async (token, i, tokens) => {
		console.log(`Printing token ${token}`);

		const buffer = await toBuffer(`https://${env.COFFEE_VAULT_DOMAIN}/doses/${token}`, {
			width: 236
		});

		const file = new File([new Blob([buffer])], `${token}.png`, { type: 'image/png' });
		const settings = { media: 'D24', cut_behavior: i == tokens.length - 1 ? 'CutAtEnd' : 'None' };
		const formData = new FormData();
		formData.append('image', file);
		formData.append('settings', JSON.stringify(settings));
		console.log(formData);

		return;
		const host = env.COFFEE_VAULT_BQL_PRINT_ADDRESS;
		const port = Number(env.COFFEE_VAULT_BQL_PRINT_PORT);
		await fetch(`http://${host}:${port}/print`, {
			method: 'POST',
			body: formData
		});
	});
	console.log('Finished printing all tokens');
}
