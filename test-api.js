const axios = require('axios');
const k = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

const apis = [
  { h: 'tiktok-video-downloader-api.p.rapidapi.com', m: 'get', u: '/media', p: 'videoUrl' },
  { h: 'tiktok-scrapper-video-music-challenges-downloader.p.rapidapi.com', m: 'get', u: '/video-without-watermark' },
  { h: 'snap-video3.p.rapidapi.com', m: 'get', u: '/tiktok' }
];

async function run() {
  for (const a of apis) {
    try {
      console.log('Testing', a.h);
      const q = { url: 'https://www.tiktok.com/@mrbeast/video/7342676839073156394' };
      if (a.p) q[a.p] = q.url;
      const r = await axios({
        method: a.m,
        url: 'https://' + a.h + a.u,
        params: a.m === 'get' ? q : {},
        data: a.m === 'post' ? q : {},
        headers: { 'X-RapidAPI-Key': k, 'X-RapidAPI-Host': a.h },
        timeout: 10000
      });
      console.log(a.h, 'WORKS:', Object.keys(r.data));
      // Log data keys or first child to be sure
      if(r.data.data) console.log('INNER DATA KEYS:', Object.keys(r.data.data));
    } catch(e) { 
      console.log(a.h, 'ERR code:', e.response?.status, 'DATA:', e.response?.data); 
    }
  }
}
run();
