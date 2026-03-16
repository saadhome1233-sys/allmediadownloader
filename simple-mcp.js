const { spawn } = require('child_process');

async function getTools(host) {
    console.log(`\n--- Fetching Tools for ${host} ---`);
    return new Promise((resolve) => {
        const proc = spawn(`npx mcp-remote https://mcp.rapidapi.com --header "x-api-host: ${host}" --header "x-api-key: e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37"`, [], { shell: true });

        let results = '';
        proc.stdout.on('data', (d) => {
            const str = d.toString();
            if (str.includes('"tools"')) results += str;
        });

        const send = (msg) => proc.stdin.write(JSON.stringify(msg) + "\n");

        setTimeout(() => send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "1" } } }), 3000);
        setTimeout(() => send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }), 6000);
        setTimeout(() => { proc.kill(); resolve(results); }, 15000);
    });
}

(async () => {
    const ytTools = await getTools('youtube-mp41.p.rapidapi.com');
    console.log('YouTube Tools:', ytTools);

    const tkTools = await getTools('tiktok-video-downloader-api.p.rapidapi.com');
    console.log('TikTok Tools:', tkTools);

    const igTools = await getTools('instagram-reels-downloader-api.p.rapidapi.com');
    console.log('Instagram Tools:', igTools);
})();
