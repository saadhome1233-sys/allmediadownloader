document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const downloadBtn = document.getElementById('download-btn');
    const resultContainer = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    const mediaCard = document.getElementById('media-card');
    const errorMessage = document.getElementById('error-message');
    const errorDetail = document.getElementById('error-detail');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Theme Toggle Logic
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });

    // Main Download Handler
    downloadBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();

        if (!url) {
            showError('Please paste a valid media link first.');
            return;
        }

        resetUI();
        showLoader();

        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch media data.');
            }

            displayMedia(data);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoader();
        }
    });

    function resetUI() {
        resultContainer.classList.remove('hidden');
        mediaCard.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function showLoader() {
        loader.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    function showError(message) {
        resultContainer.classList.remove('hidden');
        errorMessage.classList.remove('hidden');
        errorDetail.textContent = message;
    }

    /**
     * Display the retrieved media data
     */
    function displayMedia(data) {
        console.log('Displaying Media:', data);
        mediaCard.classList.remove('hidden');
        
        // Update Title
        const titleElement = document.getElementById('media-title');
        titleElement.textContent = data.title;
        if (data.author) {
            const authorSpan = document.createElement('div');
            authorSpan.className = 'author-name';
            authorSpan.innerHTML = `<i class="fa-solid fa-user"></i> ${data.author}`;
            titleElement.appendChild(authorSpan);
        }

        // Update Platform Badge
        const platformBadge = document.getElementById('platform-badge');
        const platformIcon = document.getElementById('platform-icon');
        const platformName = document.getElementById('platform-name');
        
        platformName.textContent = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
        
        platformIcon.className = ''; // Reset
        if (data.platform === 'youtube') platformIcon.className = 'fa-brands fa-youtube';
        else if (data.platform === 'tiktok') platformIcon.className = 'fa-brands fa-tiktok';
        else if (data.platform === 'instagram') platformIcon.className = 'fa-brands fa-instagram';

        // Update Preview
        const previewContainer = document.getElementById('media-preview-container');
        previewContainer.innerHTML = '';
        
        if (data.thumbnail) {
            const img = document.createElement('img');
            img.src = data.thumbnail;
            img.alt = data.title;
            previewContainer.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.innerHTML = '<i class="fa-solid fa-film fa-3x"></i>';
            previewContainer.appendChild(placeholder);
        }

        // Update Download Buttons
        const downloadOptions = document.getElementById('download-options');
        downloadOptions.innerHTML = '';

        if (data.platform === 'youtube') {
            if (data.download_links && data.download_links.length > 0) {
                renderYouTubeLinks(data.download_links, downloadOptions);
            } else if (data.progressId) {
                // Initial response from YouTube API (async)
                const loadingText = document.createElement('div');
                loadingText.className = 'processing-status';
                loadingText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing high-quality video links...';
                downloadOptions.appendChild(loadingText);
                
                pollYouTubeProgress(data.progressId, downloadOptions);
            } else {
                const finalUrl = data.download_link || data.raw.url || data.raw.downloadUrl || '#';
                const link = createDownloadBtn('Download Video', finalUrl);
                downloadOptions.appendChild(link);
            }
        } 
        else if (data.platform === 'tiktok') {
            if (data.download_links.hd) {
                downloadOptions.appendChild(createDownloadBtn('Download HD (No Watermark)', data.download_links.hd));
            }
            if (data.download_links.watermark) {
                downloadOptions.appendChild(createDownloadBtn('Download with Watermark', data.download_links.watermark));
            }
        }
        else if (data.platform === 'instagram') {
            if (data.download_link) {
                downloadOptions.appendChild(createDownloadBtn('Download Reel', data.download_link));
            }
        }

        // Add Adsterra Smartlink as a "Premium" option
        const adLink = document.createElement('a');
        adLink.href = 'https://www.profitablecpmratenetwork.com/ebmkjgy6z?key=d7603d20d629bf9ab09dc301b11054ae';
        adLink.target = '_blank';
        adLink.rel = 'noopener noreferrer';
        adLink.className = 'download-link premium-btn';
        adLink.style.background = 'rgba(232, 115, 74, 0.2)';
        adLink.style.border = '1px solid var(--primary)';
        adLink.innerHTML = `
            <span><i class="fa-solid fa-bolt" style="color: #FFD700;"></i> Premium Fast Server</span>
            <i class="fa-solid fa-star" style="color: #FFD700;"></i>
        `;
        downloadOptions.appendChild(adLink);

        mediaCard.scrollIntoView({ behavior: 'smooth' });

    }

    function renderYouTubeLinks(links, container) {
        container.innerHTML = '';
        links.forEach(format => {
            const link = createDownloadBtn(
                format.quality || format.label || 'Download HD',
                format.url
            );
            container.appendChild(link);
        });
    }

    async function pollYouTubeProgress(id, container) {
        let attempts = 0;
        const maxAttempts = 30; // 30 * 3 seconds = 90 seconds
        
        const poll = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(poll);
                container.innerHTML = '<p class="error-text">Request timed out. Please try again.</p>';
                return;
            }

            try {
                const response = await fetch(`/progress?id=${id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                console.log('Polling result:', result);

                if (result.urls && result.urls.length > 0) {
                    clearInterval(poll);
                    renderYouTubeLinks(result.urls, container);
                } else if (result.downloadUrl || result.dloadUrl) {
                    clearInterval(poll);
                    container.innerHTML = '';
                    container.appendChild(createDownloadBtn('Download Video', result.downloadUrl || result.dloadUrl));
                } else if (result.success === false) {
                    clearInterval(poll);
                    container.innerHTML = `<p class="error-text">Failed to process video: ${result.message || 'Unknown error'}</p>`;
                } else if (result.finished === true && !result.downloadUrl) {
                    // Sometimes it says finished but hasn't updated the URL yet, or it's in a different field
                    console.log('Video finished but no URL in expected fields yet...');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);
    }

    function createDownloadBtn(text, url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.className = 'download-link';
        a.innerHTML = `
            <span><i class="fa-solid fa-circle-down"></i> ${text}</span>
            <i class="fa-solid fa-chevron-right"></i>
        `;
        return a;
    }
});
