(async function () {
    ('use strict');

    const LOG = false;
    const DEFAULT_SETTINGS = { banned: [], isPopularIgnored: false };

    /**
     * Logs message to console if log flag is true
     * @param {string} message Message to log
     */
    function log(...message) {
        LOG && console.log(...message);
    }

    /**
     * Compares two strings ignoring case
     * @param {string} v1 First argument
     * @param {string} v2 Second argument
     */
    function equalsCaseInsensetive(v1, v2) {
        return (v1 || '').toString().toLowerCase() === (v2 || '').toString().toLowerCase();
    }

    /**
     * Checks if article belongs to particular user
     * @param {HTMLElement} article
     * @returns {boolean}
     */
    function belongsToAuthor(article, authorName) {
        return article == null
            ? false
            : equalsCaseInsensetive(article.querySelector(`.user-info__nickname`)?.textContent, authorName);
    }

    /**
     * Checks if article belongs to particular blog
     * @param {HTMLElement} article
     * @returns {boolean}
     */
    function belongsToBlog(article, blogName) {
        return article == null
            ? false
            : article.querySelector(`.post__title a`)?.href?.toLowerCase()?.includes(`/company/${blogName}`);
    }

    /**
     * Checks if article belongs to particular hub
     * @param {HTMLElement} article
     * @returns {boolean}
     */
    function belongsToHab(article, searchTerm) {
        return [...(article?.querySelectorAll('.hub-link') ?? [])].some(
            (el) => el.innerText?.toLowerCase() === searchTerm || el.href?.toLowerCase()?.includes(`/hub/${searchTerm}`)
        );
    }

    /**
     * Gets banned authors from the store
     * @returns {Promise<{banned:Array<{name:string, disabled: boolean}>}>}
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
     * Saves settings
     */
    async function updateSettings(settings) {
        return new Promise((resolve) => chrome.storage.sync.set({ settings }, () => resolve()));
    }

    /**
     * Detects if this is full article
     * @param {string} name name of the authour/company
     */
    function onPersonalPage(name) {
        const location = window.location.href.toLowerCase();
        const isOnAuthorPage = location.includes(`/users/${name}/posts`);
        const isOnBlogPage = location.includes(`/company/${name}/blog`);
        return isOnAuthorPage || isOnBlogPage;
    }

    /**
     * Removes article from regular list by author name
     * @param {string} keyword
     * @param {HTMLElement[]} articles
     */
    function removeArticle(keyword, articles) {
        const searchTerm = (keyword ?? '').toString().toLowerCase();

        const isOnPersonalPage = onPersonalPage(searchTerm);

        if (isOnPersonalPage) {
            log(`We are on the ${searchTerm} personal page, skipping`);
            return;
        }

        const articlesToBeDeleted = articles.filter(
            (article) =>
                belongsToAuthor(article, searchTerm) ||
                belongsToBlog(article, searchTerm) ||
                belongsToHab(article, searchTerm)
        );

        log(`Found ${articlesToBeDeleted.length} articles to ban from ${searchTerm}`);

        articlesToBeDeleted.forEach((article) => article.classList.add('sanitizer-hidden-article'));
    }

    /**
     * Gets all visible (not banned) articles
     */
    function getVisibleArticles() {
        return [...document.querySelectorAll('article:not(.post_full):not(.sanitizer-hidden-article)')];
    }

    /**
     * Creates hide button
     * @param {string} title button title
     * @param {(e:Event)=>void} handler button handler
     */
    function createHideBtn(title, handler) {
        const hideHubBtn = document.createElement('button');
        hideHubBtn.className = 'sanitizer-action-remove-hub';
        hideHubBtn.title = title;
        hideHubBtn.innerText = 'x';
        hideHubBtn.type = 'button';
        hideHubBtn.onclick = handler;

        return hideHubBtn;
    }

    /**
     * Add quick action to hide hub
     * @param {HTMLElement[]} article
     */
    function addHideHubQuickAction(article) {
        article.querySelectorAll('a.hub-link').forEach((a) => {
            const hideHubBtn = createHideBtn('Add this hub to HabroSanitizer banned list', async (event) => {
                const a = event.currentTarget.previousElementSibling;
                const hubname = a.textContent.toLocaleLowerCase();
                const settings = await getSettings();
                settings.banned.push({ name: hubname, disabled: false });
                await updateSettings(settings);
                removeArticle(hubname, getVisibleArticles());
            });
            a.insertAdjacentElement('afterend', hideHubBtn);
        });
    }

    /**
     * Add remove action button (link) to each hub link of article
     * @param {HTMLElement[]} article
     */
    function addQuickActionButtons(article) {
        addHideHubQuickAction(article);
    }

    const settings = await getSettings();
    const banned = settings.banned.map(({ name }) => name);

    log(`Found list of banned users: ${banned.join(',')} `);

    const [...allArticles] = document.querySelectorAll('article:not(.post_full)');

    banned.forEach((name) => removeArticle(name, allArticles));

    if (settings.isQuickActionsOn) {
        getVisibleArticles().forEach(addQuickActionButtons); // add hub action buttons for all visible articles
    }

    log(`Sanitization done`);
})();
