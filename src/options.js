import { Storage } from './storage.js';
import { saveToFile } from './file.js';
import { DnD } from './dragAndDrop.js';

(async function () {
    function renderBanList(banned) {
        if (!banned || !banned.length) {
            return ``;
        }

        return banned
            .map(
                ({ name }) =>
                    `<li class="grid"> <span class="lbl">${name}</span> <span></span><button class="btn" data-author-name="${name}">Remove</button></li>`
            )
            .reverse()
            .join('');
    }

    function updateBanList(banned) {
        const banList = renderBanList(banned);
        const $bans = document.querySelector('.ban-list');
        $bans.innerHTML = banList;
    }

    /**
     * @param {Storage} store
     */
    function initBanBtn(store) {
        const $banBtn = document.querySelector('#banBtn');

        if ($banBtn == null) {
            throw new Error('No element with class .banBtn found, aborting');
        }

        $banBtn.addEventListener('click', () => {
            const $banInput = document.querySelector('#banname');
            const name = $banInput.value;

            if (name == null || name === '') {
                return;
            }

            store.addNewBan({ name, disabled: false });
            $banInput.value = null;

            if (name === 'drag13') {
                alert('You just banned an author of this extension, the life will be never be the same');
            }
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
     * @param {Storage} store
     */
    function initSaveConfigBtn(store) {
        const $saveConfigBtn = document.getElementById('save-config');

        if ($saveConfigBtn == null) {
            throw new Error('No element with id save-config found, aborting');
        }

        $saveConfigBtn.addEventListener('click', async () => {
            const settings = await store.getSettings();
            saveToFile(settings, 'habrasnitizer.json');
        });
    }

    /**
     * @param {Storage} store
     */
    function initIgnoreReadingNowBlock(initialValue, store) {
        const $exlcudePopularBlock = document.getElementById('exlcude-pop-block');

        if ($exlcudePopularBlock == null) {
            throw new Error('No element with id exlcude-pop-block found, aborting');
        }

        console.log(initialValue);

        $exlcudePopularBlock.checked = !!initialValue;

        $exlcudePopularBlock.addEventListener('change', async (e) => {
            store.setIgnorePopularFlag(!!e.target.checked);
        });
    }

    /**
     * @param {Storage} store
     */
    function initDnD(store) {
        const dnd = new DnD('#drop-area');
        dnd.onFileDropped((settings) => store.applySettings(settings));
    }

    const storage = new Storage();

    const settings = await storage.getSettings();

    initBanBtn(storage);
    initBanList(storage);
    initDnD(storage);
    initSaveConfigBtn(storage);
    initIgnoreReadingNowBlock(settings.isPopularIgnored, storage);

    updateBanList(settings.banned);

    storage.onChange((x) => updateBanList(x.banned));
})();
