const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// RapidAPI Credentials (from provided configuration)
const API_KEY = 'e2ed7770d6msh0dd60003e614cd4p1cb3e1jsna03a10c43b37';

/**
 * Detect the platform from the provided URL
 */
function detectPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    return null;
}

/**
 * Extract YouTube ID from URL
 */
function getYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// POST /download endpoint
app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const platform = detectPlatform(url);

    if (!platform) {
        return res.status(400).json({ error: 'Unsupported platform or invalid URL' });
    }

    try {
        let finalUrl = url;
        if (platform === 'tiktok' && (url.includes('vm.tiktok.com') || url.includes('v.tiktok.com'))) {
            try {
                const redirectRes = await axios.get(url, { maxRedirects: 0, validateStatus: status => status >= 200 && status < 400 });
                if (redirectRes.headers.location) {
                    finalUrl = redirectRes.headers.location;
                    console.log(`[TIKTOK] Resolved shortlink to: ${finalUrl}`);
                }
            } catch (err) {
                console.log(`[TIKTOK] Shortlink resolution failed, using original url. Error: ${err.message}`);
            }
        }

        let host, endpoint, params = {};

        if (platform === 'youtube') {
            const videoId = getYouTubeID(finalUrl);
            if (!videoId) {
                return res.status(400).json({ error: 'Invalid YouTube URL' });
            }
            host = 'youtube-mp41.p.rapidapi.com';
            endpoint = '/api/v1/download';
            params = { id: videoId, format: '720' }; // Defaulting to 720p
        } else if (platform === 'tiktok') {
            const cleanedUrl = finalUrl.split('?')[0];
            host = 'tiktok-video-downloader-api.p.rapidapi.com';
            endpoint = '/media';
            params = { videoUrl: cleanedUrl };
        } else {
            const cleanedUrl = finalUrl.split('?')[0];
            host = 'instagram-video-reel-downloader-stable.p.rapidapi.com';
            endpoint = '/fetch';
            params = { url: cleanedUrl };
        }

        console.log(`[${platform.toUpperCase()}] Requesting: https://${host}${endpoint} with URL: ${params.url || params.videoUrl || params.id}`);

        const response = await axios.get(`https://${host}${endpoint}`, {
            params: params,
            timeout: 30000,
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': host
            }
        });

        const data = response.data;
        // More flexible success check: treat as success if status/success is truthy OR if we have data/urls/links
        const isSuccess = data.success || 
                         data.status === true ||
                         data.status === 200 ||
                         data.status === 'ok' || 
                         data.success === 'ok' ||
                         data.code === 200 || 
                         data.urls || 
                         data.download_link || 
                         data.downloadUrl ||
                         (data.data && Object.keys(data.data).length > 0);

        if (!isSuccess) {
            console.log(`[${platform.toUpperCase()}] Error Data:`, JSON.stringify(data));
        }
        console.log(`[${platform.toUpperCase()}] Response:`, isSuccess ? `Success` : 'Failed');

        switch (platform) {
            case 'youtube':
                // YouTube API may return download links or a progressId
                const progressId = data.progressId || (data.data && data.data.progressId) || (data.result && data.result.progressId);
                const urls = data.urls || (data.data && data.data.urls) || (data.result && data.result.urls) || [];

                res.json({
                    platform: 'youtube',
                    title: data.title || (data.data && data.data.title) || 'YouTube Video',
                    thumbnail: data.thumb || data.thumbnail || `https://img.youtube.com/vi/${getYouTubeID(url)}/maxresdefault.jpg`,
                    download_links: urls,
                    progressId: progressId || null,
                    raw: data
                });
                break;

            case 'tiktok':
                // TikTok API usually returns video data in fields like video_url, cover, description
                // Handle possible nesting in 'data' or 'result'
                let tkData = data.data || data.result || data;
                if (Array.isArray(tkData)) tkData = tkData[0];

                res.json({
                    platform: 'tiktok',
                    title: tkData.description || tkData.title || 'TikTok Video',
                    thumbnail: tkData.cover || tkData.thumbnail || '',
                    download_links: {
                        hd: tkData.video_url_no_watermark || tkData.video || tkData.play_url || tkData.play || tkData.downloadUrl || '',
                        watermark: tkData.video_url || tkData.wm_video_url || ''
                    },
                    author: tkData.author_name || (tkData.author && (tkData.author.nickname || tkData.author.username)) || '',
                    raw: data
                });
                break;

            case 'instagram':
                // Instagram API returns data in different formats (sometimes triple-nested)
                let igData = data.data || data.result || data;
                
                // If igData has a 'data' array inside it (FastLink/Stable style)
                if (igData && igData.data && Array.isArray(igData.data)) {
                    igData = igData.data[0];
                } else if (Array.isArray(igData)) {
                    igData = igData[0];
                }

                res.json({
                    platform: 'instagram',
                    title: igData.title || igData.caption || (data.data && data.data.title) || 'Instagram Reel',
                    thumbnail: igData.thumbnail || igData.cover || igData.display_url || igData.thumbnail_url || '',
                    download_link: igData.url || igData.download_url || igData.download_link || igData.video_url || '',
                    raw: data
                });
                break;
        }

    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error(`[${platform.toUpperCase()}] API Error:`, JSON.stringify(errorData));
        
        res.status(500).json({ 
            error: `Failed to fetch data from ${platform}. Please ensure the URL is correct and public.`,
            details: errorData
        });
    }
});

// GET /progress endpoint for YouTube polling
app.get('/progress', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'progressId is required' });
    }

    console.log(`[YOUTUBE] Polling Progress for ID: ${id}`);

    try {
        const host = 'youtube-mp41.p.rapidapi.com';
        const response = await axios.get(`https://${host}/api/v1/progress`, {
            params: { id },
            timeout: 30000,
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': host
            }
        });

        console.log(`[YOUTUBE] Progress response:`, response.data.status || response.data.finished ? 'Finished' : 'Processing');
        res.json(response.data);
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error(`[YOUTUBE] Progress Error:`, JSON.stringify(errorData));
        res.status(500).json({ error: 'Failed to fetch progress update', details: errorData });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
