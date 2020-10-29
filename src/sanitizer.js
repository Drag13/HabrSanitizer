(async function () {
    ('use strict');

    const LOG = false;

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
     * Gets banned authors from the store
     */
    async function getListOfBanned() {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get('settings', (data) => {
                const banned = data && data.settings ? data.settings.banned || [] : [];
                resolve(banned);
            });
        });
    }

    /**
     * Removes article from regular list by author name
     * @param {string} author
     */
    function removeArticle(author, searchFunctions) {
        const articlesFromAuthour = searchFunctions.map((getArticle) => getArticle(author)).flat();

        articlesFromAuthour.forEach((article) => (article.innerHTML = `<!--Removed -->`));
    }

    /**
     * Searches using author name
     * @param {string} author Author name
     */
    function searchByAuthorName(author) {
        const [...allArticles] = document.getElementsByTagName('article');

        log(`Found ${allArticles.length} articles`);

        const articlesFromAuthour = allArticles.filter((article) =>
            equalsCaseInsensetive(
                article.querySelector(`.user-info__nickname`)?.textContent,
                author
            )
        );

        log(`Found ${articlesFromAuthour.length} articles from author ${author}`);

        return articlesFromAuthour;
    }

    const banned = await getListOfBanned();

    log(`Found list of banned users: ${banned.map((x) => x.name).join(',')} `);

    banned.forEach(({ name }) => removeArticle(name, [searchByAuthorName]));

    log(`Sanitization done`);
})();
