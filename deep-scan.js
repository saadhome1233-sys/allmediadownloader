const fetch = require('node-fetch');
const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

async function testEndpoint(host, path, method, params, payload) {
    const url = new URL(`https://${host}${path}`);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const options = {
        method: method,
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': host,
            'Content-Type': 'application/json'
        }
    };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    try {
        const res = await fetch(url.toString(), options);
        let data = '';
        try {
            data = await res.text();
            data = JSON.parse(data);
        } catch (e) {
            data = data.slice(0, 100);
        }
        console.log(`[${res.status}] ${method} ${path} - Data:`, typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : data);
        return { status: res.status, data };
    } catch (e) {
        console.log(`Error: ${e.message}`);
        return null;
    }
}

(async () => {
    const host = 'youtube-mp41.p.rapidapi.com';
    const ytUrl = 'https://www.youtube.com/watch?v=9OwthTag_-U';
    const ytId = '9OwthTag_-U';

    console.log(`\n--- Deep Testing YouTube ${host} ---`);
    
    // Testing GET variations on /api/v1/download
    await testEndpoint(host, '/api/v1/download', 'GET', { url: ytUrl });
    await testEndpoint(host, '/api/v1/download', 'GET', { url: '9OwthTag_-U' }); // Just ID
    await testEndpoint(host, '/api/v1/download', 'GET', { id: ytId });
    await testEndpoint(host, '/api/v1/download', 'GET', { videoId: ytId });

    // Testing POST variations on /api/v1/download
    await testEndpoint(host, '/api/v1/download', 'POST', null, { url: ytUrl });
    await testEndpoint(host, '/api/v1/download', 'POST', null, { id: ytId });

    // Testing other possible paths
    await testEndpoint(host, '/dl', 'GET', { url: ytUrl });
    await testEndpoint(host, '/dl/video', 'GET', { url: ytUrl });
    await testEndpoint(host, '/video', 'GET', { url: ytUrl });

    console.log(`\n--- Testing TikTok ---`);
    const tkHost = 'tiktok-video-downloader-api.p.rapidapi.com';
    const tkUrl = 'https://www.tiktok.com/@khaby.lame/video/6954256641575456005';
    await testEndpoint(tkHost, '/', 'GET', { url: tkUrl });
    await testEndpoint(tkHost, '/tiktok', 'GET', { url: tkUrl });

    console.log(`\n--- Testing Instagram ---`);
    const igHost = 'instagram-reels-downloader-api.p.rapidapi.com';
    const igUrl = 'https://www.instagram.com/reels/DA-V0tFSpu_/';
    await testEndpoint(igHost, '/', 'GET', { url: igUrl });
    await testEndpoint(igHost, '/download', 'GET', { url: igUrl });
})();
