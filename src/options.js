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
            .join('');
    }

    function updateBanList(banned) {
        const banList = renderBanList(banned);
        const $bans = document.querySelector('.ban-list');
        $bans.innerHTML = banList;
    }

    const $banList = document.querySelector('.ban-list');
    const $banBtn = document.querySelector('#banBtn');

    if ($banList == null) {
        throw new Error('No element with class ban-list found, aborting');
    }

    if ($banBtn == null) {
        throw new Error('No element with class .banBtn found, aborting');
    }

    const storage = new Storage();

    $banList.addEventListener('click', (e) =>
        storage.removeFromBan(e.target.getAttribute('data-author-name'))
    );

    $banBtn.addEventListener('click', () => {
        const $banInput = document.querySelector('#banname');
        const name = $banInput.value;

        if (name == null || name === '') {
            return;
        }

        storage.addNewBan({ name, disabled: false });
        $banInput.value = null;

        if (name === 'drag13') {
            alert(
                'You just banned an author of this extension, the life will be never be the same'
            );
        }
    });

    const $saveConfigBtn = document.getElementById('save-config');

    $saveConfigBtn.addEventListener('click', async () => {
        const settings = await storage.getSettings();
        saveToFile(settings, 'habrasnitizer.json');
    });

    const settings = await storage.getSettings();

    updateBanList(settings.banned);

    storage.onChange((x) => updateBanList(x.banned));

    const dnd = new DnD('#drop-area');
    dnd.onFileDropped((settings) => storage.applySettings(settings));
})();
