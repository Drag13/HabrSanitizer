(async function () {
    ('use strict');

    const LOG = false;
    const DEFAULT_SETTINGS = { banned: [], isPopularIgnored: false };

    /**
     * Logs message to console if log flag is true
     * @param {string} message Message to log
     */
    function log(message) {
        LOG && console.log(message);
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
     * Gets banned authors from the store
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
     * Removes links from reading now block
     * @param {number[]} ids
     */
    function removeLinksFromReadingNow(ids) {
        const [...list] = document.querySelectorAll('#neuro-habr .content-list__item');
        const banned = list.filter((x) => {
            const href = (x.querySelector('.post-info__title')?.href ?? '').toLowerCase();
            const containsBannedId = ids.some((id) => href.includes(`post/${id}`));
            return containsBannedId;
        });

        banned.forEach((x) => (x.innerHTML = `<!-- removed-->`));
    }

    /**
     * Extracts article id from href
     * @param {string} href
     * @returns number
     */
    function extractArticleId(href) {
        if (href == null) {
            return NaN;
        }

        const trimmed = href.endsWith('/') ? href.slice(0, -1) : href;
        return trimmed.split('/').pop();
    }

    /**
     * Gets id of the banned articles
     * @param {HTMLElement[]} articles
     * @param {string[]} banned list of banned authors/blogs
     */
    function getIdForBannedArticles(articles, banned) {
        return articles
            .filter((article) => banned.some((name) => belongsToAuthor(article, name) || belongsToBlog(article, name)))
            .map((article) => extractArticleId(article.querySelector('.post__title a')?.href));
    }

    /**
     * Removes article from regular list by author name
     * @param {string} author
     * @param {HTMLElement[]} articles
     */
    function removeArticle(author, articles) {
        const searchTerm = (author ?? '').toString().toLowerCase();

        const articlesToBeDeleted = articles.filter(
            (article) => belongsToAuthor(article, searchTerm) || belongsToBlog(article, searchTerm)
        );

        log(`Found ${articlesToBeDeleted.length} articles to ban`);

        articlesToBeDeleted.forEach((article) => (article.innerHTML = `<!--${searchTerm} removed-->`));
    }

    const settings = await getSettings();
    const banned = settings.banned.map(({ name }) => name);
    const isReadingNowBlockOff = settings.isPopularIgnored;

    log(`Found list of banned users: ${banned.map((x) => x.name).join(',')} `);

    const [...allArticles] = document.querySelectorAll('article:not(.post_full)');

    if (isReadingNowBlockOff) {
        const listOfBannedId = getIdForBannedArticles(allArticles, banned);
        console.log(`Found ids for ban: "${listOfBannedId.join(',')}"`);
        removeLinksFromReadingNow(listOfBannedId);
    }

    banned.forEach((name) => removeArticle(name, allArticles));

    log(`Sanitization done`);
})();
