const { spawn } = require('child_process');

async function listTools(host) {
    console.log(`\nDiscovering tools for: ${host}`);
    return new Promise((resolve) => {
        const proc = spawn('npx', [
            'mcp-remote', 'https://mcp.rapidapi.com',
            '--header', `x-api-host: ${host}`,
            '--header', 'x-api-key: e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37'
        ], { shell: true });

        let buffer = '';
        proc.stdout.on('data', (data) => {
            const str = data.toString();
            buffer += str;
            // console.log('DEBUG:', str);
        });

        const send = (obj) => {
            proc.stdin.write(JSON.stringify(obj) + '\n');
        };

        // Initialize
        setTimeout(() => {
            send({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {
                    protocolVersion: "2024-11-05",
                    capabilities: {},
                    clientInfo: { name: "test", version: "1" }
                }
            });
        }, 5000);

        // List Tools
        setTimeout(() => {
            send({
                jsonrpc: "2.0",
                id: 2,
                method: "tools/list",
                params: {}
            });
        }, 10000);

        // Kill and resolve
        setTimeout(() => {
            proc.kill();
            console.log('--- OUTPUT ---');
            const lines = buffer.split('\n');
            lines.forEach(line => {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.id === 2) {
                        console.log(JSON.stringify(parsed.result.tools, null, 2));
                    }
                } catch(e) {}
            });
            resolve();
        }, 20000);
    });
}

(async () => {
    await listTools('tiktok-video-downloader-api.p.rapidapi.com');
    await listTools('instagram-reels-downloader-api.p.rapidapi.com');
})();
