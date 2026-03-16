const fetch = require('node-fetch');
const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

async function scanHost(host, testUrl) {
    const paths = ['/', '/dl', '/download', '/api/v1/download', '/api/v1/info', '/v1/download', '/info', '/video', '/video_info'];
    
    console.log(`\n--- Scanning ${host} with URL: ${testUrl} ---`);
    for (const path of paths) {
        try {
            // Try with 'url' param
            let res = await fetch(`https://${host}${path}?url=${encodeURIComponent(testUrl)}`, {
                headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': host }
            });
            console.log(`[${res.status}] ${path} (param: url)`);
            if (res.status === 200) {
                const data = await res.json();
                console.log(`Match Found! Data:`, JSON.stringify(data).slice(0, 150));
                continue;
            }

            // Try with 'id' param
            if (testUrl.includes('youtube.com') || testUrl.includes('youtu.be')) {
                const videoId = testUrl.includes('shorts/') ? testUrl.split('shorts/')[1].split('?')[0] : (testUrl.includes('v=') ? testUrl.split('v=')[1].split('&')[0] : '');
                if (videoId) {
                    res = await fetch(`https://${host}${path}?id=${videoId}`, {
                        headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': host }
                    });
                    console.log(`[${res.status}] ${path} (param: id=${videoId})`);
                    if (res.status === 200) {
                        const data = await res.json();
                        console.log(`Match Found! Data:`, JSON.stringify(data).slice(0, 150));
                    }
                }
            }
        } catch (e) {
            console.log(`Error at ${path}: ${e.message}`);
        }
    }
}

(async () => {
    await scanHost('youtube-mp41.p.rapidapi.com', 'https://www.youtube.com/watch?v=9OwthTag_-U');
    await scanHost('tiktok-video-downloader-api.p.rapidapi.com', 'https://www.tiktok.com/@khaby.lame/video/6954256641575456005');
    await scanHost('instagram-reels-downloader-api.p.rapidapi.com', 'https://www.instagram.com/reels/DA-V0tFSpu_/');
})();
