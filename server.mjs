import process from 'node:process';

const configuredOrigin = process.env.COFFEE_VAULT_ORIGIN;
if (!configuredOrigin) {
	throw new Error('COFFEE_VAULT_ORIGIN must be set before starting the server');
}

let origin;
try {
	origin = new URL(configuredOrigin);
	if (
		!['http:', 'https:'].includes(origin.protocol) ||
		origin.username ||
		origin.password ||
		origin.pathname !== '/' ||
		origin.search ||
		origin.hash
	) {
		throw new Error('Invalid origin');
	}
} catch {
	throw new Error(
		'COFFEE_VAULT_ORIGIN must be an HTTP(S) origin without credentials, a path, query or fragment'
	);
}

// Adapter-node 6 derives the request origin from headers. Supply our own headers
// before its request handler runs, rather than trusting values sent by a client.
const protocolHeader = 'x-coffee-vault-protocol';
const hostHeader = 'x-coffee-vault-host';
process.env.PROTOCOL_HEADER = protocolHeader;
process.env.HOST_HEADER = hostHeader;
process.env.PORT_HEADER = '';

// Import after configuring the adapter, retaining its listener and shutdown handling.
const { server } = await import('./build/index.js');
server.prependListener('request', (request) => {
	request.headers[protocolHeader] = origin.protocol.slice(0, -1);
	request.headers[hostHeader] = origin.host;
});
