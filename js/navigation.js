var Navigation = {
    currentFocus: null,
    selectableElements: [],

    init() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.updateSelectables();
        this.focusElement(this.selectableElements[0]);
    },

    updateSelectables() {
        this.selectableElements = Array.from(document.querySelectorAll('.selectable, .btn, input'));
    },

    handleKeyDown(e) {
        const key = e.keyCode || e.which;
        console.log('Key pressed:', key);

        // Mostrar controles em qualquer tecla
        if (typeof Player !== 'undefined' && Player.showControls) {
            Player.showControls();
        }

        switch(key) {
            case 37: // Left
                this.moveFocus('left');
                break;
            case 38: // Up
                this.moveFocus('up');
                break;
            case 39: // Right
                this.moveFocus('right');
                break;
            case 40: // Down
                this.moveFocus('down');
                break;
            case 13: // Enter
            case 86: // Confirm
                if (this.currentFocus) this.currentFocus.click();
                break;
            case 461: // Back
            case 27:  // ESC
            case 8:   // Backspace
                this.handleBack();
                break;
        }
    },

    focusElement(el) {
        if (!el) return;
        if (this.currentFocus) this.currentFocus.blur();
        this.currentFocus = el;
        el.focus();
        
        // Scroll inteligente para Sidebar
        const isSidebarItem = el.closest('.sidebar');
        if (isSidebarItem) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    moveFocus(direction) {
        const currentRect = this.currentFocus.getBoundingClientRect();
        let closest = null;
        let minDistance = Infinity;

        this.selectableElements.forEach(el => {
            if (el === this.currentFocus) return;
            const rect = el.getBoundingClientRect();

            let isCorrectDirection = false;
            if (direction === 'left' && rect.left < currentRect.left) isCorrectDirection = true;
            if (direction === 'right' && rect.left > currentRect.left) isCorrectDirection = true;
            if (direction === 'up' && rect.top < currentRect.top) isCorrectDirection = true;
            if (direction === 'down' && rect.top > currentRect.top) isCorrectDirection = true;

            if (isCorrectDirection) {
                const dist = Math.sqrt(
                    Math.pow(rect.left - currentRect.left, 2) + 
                    Math.pow(rect.top - currentRect.top, 2)
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closest = el;
                }
            }
        });

        if (closest) this.focusElement(closest);
    },

    handleBack() {
        console.log('Back pressed');
        // Lógica para fechar modais ou voltar menus
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
            modal.classList.add('hidden');
            this.updateSelectables();
            this.focusElement(this.selectableElements[0]);
        }
    }
};

window.addEventListener('load', () => Navigation.init());
