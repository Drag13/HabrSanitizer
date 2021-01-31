/** @typedef {{banned:Array<{name:string, disabled: boolean}>,isQuickActionsOn: boolean}} SanitizerSettings */

(async function () {
    ('use strict');

    const LOG = false;
    const DEFAULT_SETTINGS = { banned: [], isQuickActionsOn: false };
    const hideHubButtonClassName = 'sanitizer-action-remove-hub';
    const hiddenArticleClassName = 'sanitizer-hidden-article';
    const selectors = {
        author: '.user-info__nickname',
        company: '.post__title a',
        hub: '.hub-link',
        article: 'article',
        visibleArticle: `article:not(.${hiddenArticleClassName})`,
        hiddenArticle: `article.${hiddenArticleClassName}`,
    };

    /**
     * Logs message to console if log flag is true
     * @param {string} message Message to log
     */
    function log(...message) {
        LOG && console.log(...message);
    }

    /**
     * Check if string is empty (null, undefined, sapces)
     * @param {string} v string value
     * @return {boolean}
     */
    function isEmpty(v) {
        return v == null || v.toString().trim() === '';
    }

    /**
     * Compares two strings ignoring case
     * @param {string} v1 First argument
     * @param {string} v2 Second argument
     * @return {boolean}
     */
    function equalsCaseInsensetive(v1, v2) {
        return (v1 || '').toString().toLowerCase() === (v2 || '').toString().toLowerCase();
    }

    /**
     * Checks if current page is personal
     * @param {string} url current url
     * @return {boolean}
     */
    function onPersonalPage(url) {
        const location = url.toLowerCase();

        const onUsersPageRegex = /\/users\/.*\/posts/;
        const onBlogPageRegex = /\/company\/.*\/blog/;
        const onArticlePageRegex = /\/post\/d*/;

        return onUsersPageRegex.test(location) || onBlogPageRegex.test(location) || onArticlePageRegex.test(location);
    }

    /**
     * Checks if article belongs to particular user
     * @param {HTMLElement} article
     * @param {string} authorName name of the banned author
     * @return {boolean}
     */
    function belongsToAuthor(article, authorName) {
        return article == null
            ? false
            : equalsCaseInsensetive(article.querySelector(selectors.author)?.textContent, authorName);
    }

    /**
     * Checks if article belongs to particular blog
     * @param {HTMLElement} article
     * @param {string} blogName Name of the blog
     * @return {boolean}
     */
    function belongsToBlog(article, blogName) {
        return article == null
            ? false
            : article.querySelector(selectors.company)?.href?.toLowerCase()?.includes(`/company/${blogName}`);
    }

    /**
     * Checks if article belongs to particular hub
     * @param {HTMLElement} article
     * @param {string} searchTerm Name of the hub
     * @return {boolean}
     */
    function belongsToHab(article, searchTerm) {
        return [...(article?.querySelectorAll(selectors.hub) ?? [])].some(
            (el) => el.innerText?.toLowerCase() === searchTerm || el.href?.toLowerCase()?.includes(`/hub/${searchTerm}`)
        );
    }

    /**
     * Gets banned authors from the store
     * @return {Promise<SanitizerSettings>}
     */
    async function getSettings() {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get('settings', (data) => {
                const settings = data && data.settings && data.settings.banned ? data.settings : DEFAULT_SETTINGS;
                resolve(settings);
            });
        });
    }

    /**
     * Update settings
     * @param {SanitizerSettings} settings updates settings
     */
    async function updateSettings(settings) {
        return new Promise((resolve) => chrome.storage.sync.set({ settings }, () => resolve()));
    }

    /**
     * Gets all visible (not banned) articles
     * @return {HtmlELement[]} Array of visible articles
     */
    function getVisibleArticles() {
        return [...document.querySelectorAll(selectors.visibleArticle)];
    }

    /**
     * Gets all hidden (banned) articles
     * @return {HtmlELement[]} Array of hidden articles
     */
    function getHiddenArticles() {
        return [...document.querySelectorAll(selectors.hiddenArticle)];
    }

    /**
     * Update settings with new search term and hide articles belongs to search term
     * @param {Event} e
     */
    async function hideBtnHandler(e) {
        if (e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }

        const rawSearchTerm = e.target.dataset.searchTerm;

        if (isEmpty(rawSearchTerm)) {
            return;
        }

        const searchTerm = rawSearchTerm.toLowerCase();
        const settings = await getSettings();

        const alreadyBanned = settings.banned.find((x) => equalsCaseInsensetive(x.name, searchTerm)); // in case of different pages

        if (!alreadyBanned) {
            settings.banned.push({ name: searchTerm, disabled: false });
            await updateSettings(settings);
        }

        tryRemoveArticles(searchTerm);
    }

    /**
     * Creates hide button
     * @param {string} title button title
     * @param {string} searchTerm key to ignore article
     * @return {HTMLButtonElement}
     */
    function createHideBtn(title, searchTerm) {
        const hideHubBtn = document.createElement('button');
        hideHubBtn.className = hideHubButtonClassName;
        hideHubBtn.title = title;
        hideHubBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 572.098 572.098">
        <path d="M99.187 398.999l44.333-44.332c-24.89-15.037-47.503-33.984-66.763-56.379 29.187-33.941 66.053-60.018 106.947-76.426-6.279 14.002-9.853 29.486-9.853 45.827 0 16.597 3.696 32.3 10.165 46.476l35.802-35.797c-5.698-5.594-9.248-13.36-9.248-21.977 0-17.02 13.801-30.82 30.82-30.82 8.611 0 16.383 3.55 21.971 9.248l32.534-32.534 36.635-36.628 18.366-18.373c-21.206-4.186-42.896-6.469-64.848-6.469-107.663 0-209.732 52.155-273.038 139.518L0 298.288l13.011 17.957c23.819 32.871 53.14 60.754 86.176 82.754zM459.208 188.998l-44.854 44.854c30.539 16.071 58.115 37.846 80.986 64.437-52.167 60.662-128.826 96.273-209.292 96.273-10.3 0-20.533-.6-30.661-1.744l-52.375 52.375c26.903 6.887 54.762 10.57 83.036 10.57 107.663 0 209.738-52.154 273.038-139.523l13.011-17.957-13.011-17.956c-27.063-37.332-61.242-68.177-99.878-91.329z"/>
        <path d="M286.049 379.888c61.965 0 112.198-50.234 112.198-112.199 0-5.588-.545-11.035-1.335-16.402L269.647 378.56c5.368.789 10.814 1.328 16.402 1.328zM248.815 373.431L391.79 230.455l4.994-4.994 45.796-45.796 86.764-86.77c13.543-13.543 13.543-35.502 0-49.046-6.77-6.769-15.649-10.159-24.523-10.159s-17.754 3.384-24.522 10.159l-108.33 108.336-22.772 22.772-29.248 29.248-48.14 48.14-34.456 34.456-44.027 44.027-33.115 33.115-45.056 45.055-70.208 70.203c-13.543 13.543-13.543 35.502 0 49.045 6.769 6.77 15.649 10.16 24.523 10.16s17.754-3.385 24.523-10.16l88.899-88.898 50.086-50.086 15.837-15.831z"/></svg>`;
        hideHubBtn.type = 'button';
        hideHubBtn.dataset.searchTerm = searchTerm;
        hideHubBtn.onclick = hideBtnHandler;

        return hideHubBtn;
    }

    /**
     * Add quick action to hide hub
     * @param {HTMLElement} article
     */
    function addHideHubQuickAction(article) {
        article.querySelectorAll('a.hub-link').forEach((a) => {
            const searchTerm = a.innerText;
            if (isEmpty(searchTerm)) {
                return;
            }

            const hideHubBtn = createHideBtn('Add this hub to HabroSanitizer the banlist', searchTerm, hideBtnHandler);
            a.insertAdjacentElement('afterend', hideHubBtn);
        });
    }

    /**
     *
     * @param {HTMLElement} article
     */
    function addHideAuthorQuickAction(article) {
        article.querySelectorAll('.user-info__nickname').forEach((t) => {
            const searchTerm = t.innerText;
            if (isEmpty(searchTerm)) {
                return;
            }

            const hideAuthBtn = createHideBtn(`Add this author/blog the banlist`, searchTerm, hideBtnHandler);
            t.insertAdjacentElement('afterend', hideAuthBtn);
        });
    }

    /**
     * Add remove action button (link) to each hub link of article
     * @param {HTMLElement} article
     */
    function addQuickActionButtons(article) {
        addHideHubQuickAction(article);
        addHideAuthorQuickAction(article);
    }

    /**
     * Delete action button from each hub link of article
     * @param {HTMLElement} article
     */
    function delQuickActionButtons(article) {
        article.querySelectorAll(`.${hideHubButtonClassName}`).forEach(el => el.remove());
    }

    /**
     * Hides article from site page by keyword
     * @param {string} keyword
     */
    function tryRemoveArticles(keyword) {
        if (isEmpty(keyword)) {
            log(`Search term is null, ignoring`);
            return;
        }

        const searchTerm = keyword.toString().toLowerCase();

        const articlesToBeDeleted = getVisibleArticles().filter(
            (article) =>
                belongsToAuthor(article, searchTerm) ||
                belongsToBlog(article, searchTerm) ||
                belongsToHab(article, searchTerm)
        );

        log(`Found ${articlesToBeDeleted.length} articles to ban from ${searchTerm}`);

        articlesToBeDeleted.forEach((article) => {
            if ( settings.isQuickActionsOn ) {
                delQuickActionButtons(article);
            }
            article.classList.add(hiddenArticleClassName);
        });
    }

    /**
     * Restores visibility of article on site page by keyword (search term)
     * @param {string} searchTerm
     */
    function tryRestoreArticles(searchTerm) {
        const articlesToBeRestored = getHiddenArticles().filter(
            (article) =>
                belongsToAuthor(article, searchTerm) ||
                belongsToBlog(article, searchTerm) ||
                belongsToHab(article, searchTerm)
        );

        log(`Found ${articlesToBeRestored.length} articles to be restored for '${searchTerm}'`);

        articlesToBeRestored.forEach((article) => {
            if ( settings.isQuickActionsOn ) {
                addQuickActionButtons(article);
            }
            article.classList.remove(hiddenArticleClassName);
        });
    }

    /**
     * Subscribe to settings change event, watched by settings key
     * @param {string} key
     * @param {Function} handler
     */
    function onSettingsChange(key, handler) {
        chrome.storage.onChanged.addListener((changes) => {
            const nv = changes.settings.newValue?.[key];
            const ov = changes.settings.oldValue?.[key];
            if ( JSON.stringify(nv) !== JSON.stringify(ov) ) {
                handler(nv, ov);
            }
        });
    }

    /**
     * Reaction on switching isQuickActionsOn on options page
     * @param {object} newValue New value of setting
     */
    function onQuickActionsVisibilityChange(newValue) {
        getVisibleArticles().forEach(newValue ? addQuickActionButtons : delQuickActionButtons);
        settings.isQuickActionsOn = newValue;
    }

    /**
     * Reaction on changed ban list on options page
     * @param {object} newValue New value of setting
     * @param {object} oldValue Old value of setting
     */
    function onBanListChange(newValue, oldValue) {
        const newList = newValue.filter(x => !x.disabled).map(x => x.name);
        const oldList = oldValue.filter(x => !x.disabled).map(x => x.name);
        const added = newList.filter(x => !oldList.includes(x));
        const removed = oldList.filter(x => !newList.includes(x));
        added.forEach(tryRemoveArticles);
        removed.forEach(tryRestoreArticles);
        settings.banned = newValue;
    }

    const isOnPersonalPage = onPersonalPage(window.location.href);

    if (isOnPersonalPage) {
        log('We are on the perosnal page, HabroSanitizer actions disabled');
        return;
    }

    const settings = await getSettings();
    const banned = settings.banned.map(({ name }) => name);
    log(`Found list of banned users: ${banned.join(',')} `);

    banned.forEach(tryRemoveArticles);
    settings.isQuickActionsOn && getVisibleArticles().forEach(addQuickActionButtons);
    onSettingsChange('isQuickActionsOn', onQuickActionsVisibilityChange);
    onSettingsChange('banned', onBanListChange);

    log('Sanitization done and inited for actions');
})();
