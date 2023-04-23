import { Storage } from './storage.js';
import { saveToFile } from './file.js';
import { DnD } from './dragAndDrop.js';

/**
 * BanList
 * @typedef {Array<{name:string}>} BanList
 **/

(async function () {
    /**
     * Renders list of banned
     * @param {BanList} banned List of banned
     * @return {string}
     */
    function renderBanList(banned) {
        if (!banned || !banned.length) {
            return ``;
        }

        document.documentElement.style.setProperty('--grid-num-items', banned.length);

        return banned
            .map(({ name }) => name) // creating a new array for sorting
            .sort((a, b) => a.localeCompare(b)) // 'sort' method modifies input array
            .map((name) =>
                    `<div>
                    <span class="lbl">${name}</span>
                    <button class="btn round" data-author-name="${name}">
                    <svg width="20px"
                         height="20px"
                         fill="none"
                         stroke="currentColor"
                         stroke-width="2px"
                         stroke-linecap="round"
                         stroke-linejoin="round"
                         data-author-name="${name}"
                    >
                        <use xlink:href="./asset/sprites.svg#minus"/>
                    </svg>
                    </button>
                    </div>`
            )
            .join('');
    }

    /**
     *Updates list of banned
     * @param {BanList} banned List of banned
     */
    function updateBanList(banned) {
        const banList = renderBanList(banned);
        const $bans = document.querySelector('.ban-list');
        $bans.innerHTML = banList;
    }

    /**
     * @param {Storage} store
     */
    function initBanForm(store) {
        const $banForm = document.querySelector('#ban-form');

        if ($banForm == null) {
            throw new Error('No element with selector #ban-form found, aborting');
        }

        $banForm.addEventListener('submit', async (e) => {
            if (e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
            }

            const $banInput = document.querySelector('#banname');
            const rawName = $banInput.value;
            const name = rawName != null ? rawName.trim().toLowerCase() : null;
            if (name == null || name === '') {
                return false;
            }

            const isAdded = await store.addNewBan({ name, disabled: false });
            isAdded && ($banInput.value = null);

            if (name === 'drag13') {
                alert('You just banned an author of this extension, the life will be never be the same');
            }
            return false;
        });
    }

    /**
     * @param {Storage} store
     */
    function initBanList(store) {
        const $banList = document.querySelector('.ban-list');
        if ($banList == null) {
            throw new Error('No element with class ban-list found, aborting');
        }
        $banList.addEventListener('click', (e) => store.removeFromBan(e.target.getAttribute('data-author-name')));
    }

    /**
     * Initialize list view mode controls
     * @param {Storage} store
     */
    function initBanListViewMode(store) {
        const $banList = document.querySelector('.ban-list');

        document.getElementById('list-mode-grid-single').addEventListener('click', (e) => {
            $banList.classList.remove('ban-list-grid', 'ban-list-grid-columns');
            store.setListViewMode(e.target.value);
        });

        document.getElementById('list-mode-grid-rows').addEventListener('click', (e) => {
            $banList.classList.remove('ban-list-grid-columns');
            $banList.classList.add('ban-list-grid');
            store.setListViewMode(e.target.value);
        });

        document.getElementById('list-mode-grid-columns').addEventListener('click', (e) => {
            $banList.classList.add('ban-list-grid', 'ban-list-grid-columns');
            store.setListViewMode(e.target.value);
        });

        let cbIndex;
        switch (settings.listViewMode) {
            case 'rows':
                $banList.classList.add('ban-list-grid');
                cbIndex = 1;
                break;
            case 'columns':
                $banList.classList.add('ban-list-grid', 'ban-list-grid-columns');
                cbIndex = 2;
                break;
            default:
                cbIndex = 0;
        }
        document.getElementsByName('ban-grid-mode')[cbIndex].checked = true;
    }

    /**
     * @param {Storage} store
     */
    function initSaveConfigBtn(store) {
        const $saveConfigBtn = document.getElementById('save-config');

        if ($saveConfigBtn == null) {
            throw new Error('No element with id save-config found, aborting');
        }

        $saveConfigBtn.addEventListener('click', async () => {
            const settings = await store.loadSettings();
            saveToFile(settings, 'habrasnitizer.json');
        });
    }

    /**
     * @param {Storage} store
     */
    function initDnD(store) {
        const dnd = new DnD('#drop-area');
        dnd.onFileDropped((settings) => store.applySettings(settings));
    }

    /**
     * Initialize handlers for content options changes
     * @param {Storage} store
     */
    function initQuickActions(store) {
        const $quickActionCheckbox = document.getElementById('quick-actions-toggler');

        if ($quickActionCheckbox == null) {
            throw new Error('No element with id quick-actions-toggler found, aborting');
        }

        $quickActionCheckbox.checked = settings.isQuickActionsOn;
        $quickActionCheckbox.addEventListener('click', (e) => store.setQuickActionsFlag(e.target.checked));
    }

    const storage = new Storage();

    const settings = await storage.loadSettings();

    initBanForm(storage);
    initBanList(storage);
    initBanListViewMode(storage);
    initDnD(storage);
    initQuickActions(storage);
    initSaveConfigBtn(storage);

    updateBanList(settings.banned);

    storage.onSettingsChange('banned', updateBanList);
})();
