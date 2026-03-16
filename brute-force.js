const fetch = require('node-fetch');

const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

async function testEndpoints(host) {
    const url = 'https://www.youtube.com/shorts/9OwthTag_-U';
    const endpoints = ['/video', '/api/video', '/video-info', '/api/info', '/get-video', '/download'];
    
    console.log(`\n--- Testing ${host} ---`);
    for (const endpoint of endpoints) {
        try {
            const res = await fetch(`https://${host}${endpoint}?url=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': host
                }
            });
            const text = await res.text();
            console.log(`[${res.status}] ${endpoint}: ${text.slice(0, 50)}...`);
            if (res.status === 200) {
                console.log(`✅ Success on ${endpoint}!`);
                return endpoint;
            }
        } catch (e) {
            console.log(`[ERR] ${endpoint}: ${e.message}`);
        }
    }
}

(async () => {
    await testEndpoints('youtube-mp41.p.rapidapi.com');
    await testEndpoints('tiktok-video-downloader-api.p.rapidapi.com');
    await testEndpoints('instagram-reels-downloader-api.p.rapidapi.com');
})();
