const fetch = require('node-fetch');
const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

async function testTarget() {
    const host = 'youtube-mp41.p.rapidapi.com';
    const path = '/api/v1/download';
    const url = 'https://www.youtube.com/watch?v=9OwthTag_-U';
    
    console.log(`Checking ${host}${path}`);
    const res = await fetch(`https://${host}${path}?url=${encodeURIComponent(url)}`, {
        headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': host }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
}

testTarget();
