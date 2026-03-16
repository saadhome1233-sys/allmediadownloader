const axios = require('axios');
const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

async function test(host, endpoint, params) {
    try {
        console.log(`Testing ${host}${endpoint} with ${JSON.stringify(params)}`);
        const res = await axios.get(`https://${host}${endpoint}`, {
            params,
            headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': host },
            timeout: 15000
        });
        console.log(`[SUCCESS] ${res.status}:`, JSON.stringify(res.data).slice(0, 300));
        return true;
    } catch (e) {
        console.log(`[FAILED] ${e.response ? e.response.status : e.message}:`, e.response ? JSON.stringify(e.response.data).slice(0, 200) : '');
        return false;
    }
}

(async () => {
    const tkHost = 'tiktok-video-downloader-api.p.rapidapi.com';
    const tkUrl = 'https://www.tiktok.com/@khaby.lame/video/6954256641575456005';
    
    console.log('\n--- TIKTOK ---');
    await test(tkHost, '/media', { videoUrl: tkUrl });
    await test(tkHost, '/video', { url: tkUrl });
    await test(tkHost, '/dl', { url: tkUrl });

    const igHost = 'instagram-reels-downloader-api.p.rapidapi.com';
    const igUrl = 'https://www.instagram.com/reels/DA-V0tFSpu_/';
    
    console.log('\n--- INSTAGRAM ---');
    await test(igHost, '/download', { url: igUrl });
    await test(igHost, '/info', { url: igUrl });
})();
