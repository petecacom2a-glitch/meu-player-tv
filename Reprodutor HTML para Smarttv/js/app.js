const M3UParser = {
    async parse(url) {
        try {
            console.log('Baixando lista M3U...');
            const response = await fetch(url);
            const text = await response.text();
            const lines = text.split('\n');
            const links = [];
            let currentTitle = '';

            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('#EXTINF:')) {
                    const commaIndex = line.lastIndexOf(',');
                    currentTitle = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Canal sem nome';
                } else if (line.startsWith('http')) {
                    links.push({
                        id: Date.now() + Math.random(),
                        url: line,
                        title: currentTitle || `Link ${links.length + 1}`
                    });
                    currentTitle = '';
                }
            }
            return links;
        } catch (e) {
            console.error('Erro ao processar M3U:', e);
            return [];
        }
    }
};

var App = {
    links: [],

    init() {
        this.loadLinks();
        this.setupButtons();
        this.renderLinks();
    },

    loadLinks() {
        const saved = localStorage.getItem('tv_links');
        this.links = saved ? JSON.parse(saved) : [];
    },

    saveLinks() {
        localStorage.setItem('tv_links', JSON.stringify(this.links));
    },

    currentIndex: -1,

    setupButtons() {
        const btnAdd = document.getElementById('btn-add');
        const btnSave = document.getElementById('btn-save');
        const btnCancel = document.getElementById('btn-cancel');
        const modal = document.getElementById('modal-add');
        const input = document.getElementById('input-link');

        btnAdd.addEventListener('click', () => {
            modal.classList.remove('hidden');
            setTimeout(() => input.focus(), 100);
            Navigation.updateSelectables();
        });

        btnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
            Navigation.updateSelectables();
            Navigation.focusElement(btnAdd);
        });

        btnSave.addEventListener('click', async () => {
            const url = input.value.trim();
            if (!url) return;

            const isM3U = url.toLowerCase().includes('.m3u') && !url.includes('.m3u8');
            const isIPTVOrg = url.toLowerCase().includes('iptv-org') && url.toLowerCase().endsWith('.m3u');

            if (isM3U || isIPTVOrg) {
                btnSave.innerText = 'Processando...';
                const newLinks = await M3UParser.parse(url);
                if (newLinks.length > 0) {
                    this.links = [...this.links, ...newLinks];
                    this.saveLinks();
                    this.renderLinks();
                    alert(`${newLinks.length} canais adicionados da lista!`);
                } else {
                    alert('Erro ao processar lista. Verifique o link.');
                }
                btnSave.innerText = 'Salvar';
            } else {
                this.links.push({ id: Date.now(), url: url, title: `Vídeo ${this.links.length + 1}` });
                this.saveLinks();
                this.renderLinks();
            }

            input.value = '';
            modal.classList.add('hidden');
            Navigation.updateSelectables();
            Navigation.focusElement(btnAdd);
        });
    },

    renderLinks() {
        const list = document.getElementById('links-list');
        list.innerHTML = '';

        this.links.forEach((link, index) => {
            const container = document.createElement('div');
            container.className = 'link-item-container';
            
            const card = document.createElement('div');
            card.className = 'link-card selectable';
            card.innerHTML = `<span>${link.title}</span>`;
            card.addEventListener('click', () => {
                this.currentIndex = index;
                Player.load(link.url);
            });

            const delBtn = document.createElement('div');
            delBtn.className = 'btn-delete selectable';
            delBtn.innerHTML = '×';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLink(index);
            });

            container.appendChild(card);
            container.appendChild(delBtn);
            list.appendChild(container);
        });

        Navigation.updateSelectables();
    },

    deleteLink(index) {
        if (confirm(`Excluir "${this.links[index].title}"?`)) {
            this.links.splice(index, 1);
            this.saveLinks();
            this.renderLinks();
            Navigation.focusElement(document.getElementById('btn-add'));
        }
    },

    playNext() {
        if (this.links.length === 0) return;
        
        this.currentIndex++;
        if (this.currentIndex >= this.links.length) {
            this.currentIndex = 0;
        }

        const nextLink = this.links[this.currentIndex];
        console.log('App: Próximo canal ->', nextLink.title);
        Player.load(nextLink.url, false); // Não tira o foco da sidebar se o usuário estiver lá
        this.focusCurrentChannel();
    },

    playPrevious() {
        if (this.links.length === 0) return;
        
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.links.length - 1;
        }

        const prevLink = this.links[this.currentIndex];
        console.log('App: Canal anterior ->', prevLink.title);
        Player.load(prevLink.url, false);
        this.focusCurrentChannel();
    },

    focusCurrentChannel() {
        const list = document.getElementById('links-list');
        const cards = list.querySelectorAll('.link-card');
        if (cards[this.currentIndex]) {
            Navigation.focusElement(cards[this.currentIndex]);
        }
    }
};

window.addEventListener('load', () => App.init());
