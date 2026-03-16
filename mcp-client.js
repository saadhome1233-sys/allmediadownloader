const { spawn } = require('child_process');

async function getTools() {
    return new Promise((resolve, reject) => {
        const proc = spawn('npx mcp-remote https://mcp.rapidapi.com --header "x-api-host: youtube-mp41.p.rapidapi.com" --header "x-api-key: e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37"', [], { shell: true });

        let output = '';
        let toolsFound = false;

        const onData = (data) => {
            const str = data.toString();
            console.log('LOG:', str);
            
            if (str.includes('Local STDIO server running')) {
                console.log('Sending initialize...');
                setTimeout(() => {
                    const initMsg = JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "initialize",
                        params: {
                            protocolVersion: "2024-11-05",
                            capabilities: {},
                            clientInfo: { name: "test", version: "1.0.0" }
                        }
                    }) + "\n";
                    proc.stdin.write(initMsg);
                }, 2000);
            }
            
            if (str.includes('"id":1') || str.includes('"id": 1')) {
                console.log('Initialize response received. Sending tools/list...');
                setTimeout(() => {
                    const listToolsMsg = JSON.stringify({
                        jsonrpc: "2.0",
                        id: 2,
                        method: "tools/list",
                        params: {}
                    }) + "\n";
                    proc.stdin.write(listToolsMsg);
                }, 1000);
            }

            if (str.includes('"tools"')) {
                toolsFound = true;
                output += str;
                console.log('Tools Found!');
            }
        };

        proc.stdout.on('data', onData);
        proc.stderr.on('data', onData);

        setTimeout(() => {
            console.log('Closing process...');
            proc.kill();
            if (toolsFound) resolve(output);
            else reject('Timeout or no tools found');
        }, 30000);
    });
}

getTools().then(tools => {
    console.log('Detected Tools:', tools);
}).catch(err => {
    console.error(err);
});
