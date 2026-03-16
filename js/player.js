var Player = {
    video: null,
    controls: null,
    progressBar: null,
    currentTimeText: null,
    durationText: null,
    playIcon: null,
    pauseIcon: null,
    loadTimeout: null,
    hideTimeout: null,

    init() {
        this.video = document.getElementById('main-player');
        this.controls = document.getElementById('custom-controls');
        this.progressBar = document.getElementById('progress-bar');
        this.currentTimeText = document.getElementById('current-time');
        this.durationText = document.getElementById('duration');
        this.playIcon = document.getElementById('icon-play');
        this.pauseIcon = document.getElementById('icon-pause');
        
        this.setupEventListeners();
        this.setupControlButtons();
    },

    setupEventListeners() {
        this.video.addEventListener('error', (e) => {
            const error = this.video.error;
            console.error('Erro no player:', error);
            this.clearWatchdog();
            
            let message = 'Erro ao carregar o vídeo.';
            if (error && error.code === 4) message = 'Formato não suportado ou link quebrado.';
            
            const videoWrapper = document.getElementById('video-wrapper');
            videoWrapper.setAttribute('data-status', 'erro');
            this.showOnScreenError(message);
            this.handleAutoNext();
        });

        this.video.addEventListener('ended', () => {
            console.log('Vídeo finalizado');
            this.handleAutoNext();
        });

        this.video.addEventListener('timeupdate', () => this.updateUI());
        this.video.addEventListener('loadedmetadata', () => {
            this.durationText.innerText = this.formatTime(this.video.duration);
        });

        this.video.addEventListener('play', () => {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
        });

        this.video.addEventListener('pause', () => {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
        });
    },

    setupControlButtons() {
        document.getElementById('btn-play-pause').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-prev-channel').addEventListener('click', () => {
            if (window.App) window.App.playPrevious();
        });
        document.getElementById('btn-next-channel').addEventListener('click', () => {
            if (window.App) window.App.playNext();
        });

        // Mostrar controles em qualquer interação
        window.addEventListener('keydown', () => this.showControls());
        window.addEventListener('mousemove', () => this.showControls());
        window.addEventListener('mousedown', () => this.showControls());
        window.addEventListener('touchstart', () => this.showControls());
    },

    updateUI() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.currentTimeText.innerText = this.formatTime(this.video.currentTime);
    },

    formatTime(seconds) {
        if (!seconds) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    },

    showControls() {
        if (!this.controls) return;
        this.controls.classList.add('visible');
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            if (!this.video.paused) {
                this.controls.classList.remove('visible');
            }
        }, 5000);
    },

    load(url, focusPlayBtn = true) {
        console.log('Player: Carregando canal ->', url);
        this.clearWatchdog();
        
        const videoWrapper = document.getElementById('video-wrapper');
        videoWrapper.setAttribute('data-status', 'carregando');

        this.video.innerHTML = '';
        this.video.removeAttribute('src');
        
        try {
            this.video.load();
        } catch (e) {}

        // 15s Watchdog
        this.loadTimeout = setTimeout(() => {
            if (this.video.paused || this.video.readyState < 3) {
                console.error('Player: Erro de Timeout');
                videoWrapper.setAttribute('data-status', 'erro');
                this.showOnScreenError("Tempo limite esgotado.");
                this.handleAutoNext();
            }
        }, 15000);

        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('.m3u8')) {
            this.addSource(url, 'application/x-mpegURL');
        } else if (lowerUrl.includes('.ts')) {
            this.addSource(url, 'video/mp2t');
        } else {
            this.addSource(url, 'video/mp4');
        }

        setTimeout(() => {
            this.video.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Player Play Error:', err);
                }
            }).then(() => {
                if (this.video.readyState >= 3) {
                    this.clearWatchdog();
                    videoWrapper.setAttribute('data-status', 'reproduzindo');
                    this.showControls();
                    
                    if (focusPlayBtn && typeof Navigation !== 'undefined') {
                        Navigation.focusElement(document.getElementById('btn-play-pause'));
                    }
                }
            });
        }, 300);
    },

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
        this.showControls();
    },

    seek(seconds) {
        this.video.currentTime += seconds;
        this.showControls();
    },

    clearWatchdog() {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }
    },

    handleAutoNext() {
        if (window.App && typeof window.App.playNext === 'function') {
            this.showOnScreenError("Pulando para o próximo vídeo em 3 segundos...");
            setTimeout(() => {
                if (this.video.paused || this.video.readyState < 3) {
                    window.App.playNext();
                }
            }, 3000);
        }
    },

    addSource(url, type) {
        const source = document.createElement('source');
        source.src = url;
        if (type) source.type = type;
        this.video.appendChild(source);
    },

    showOnScreenError(msg) {
        let errorBanner = document.getElementById('error-banner');
        if (!errorBanner) {
            errorBanner = document.createElement('div');
            errorBanner.id = 'error-banner';
            errorBanner.style.cssText = 'position:fixed; top:50px; left:50%; transform:translateX(-50%); background:rgba(231, 76, 60, 0.9); color:white; padding:20px; border-radius:10px; z-index:2000; font-size:24px;';
            document.body.appendChild(errorBanner);
        }
        errorBanner.innerText = msg;
        errorBanner.style.display = 'block';
        setTimeout(() => errorBanner.style.display = 'none', 5000);
    }
};

window.addEventListener('load', () => Player.init());
