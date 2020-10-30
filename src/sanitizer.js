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
     * @param {HTMLElement[]} articles
     */
    function removeArticle(author, articles, searchFunctions) {
        const searchTerm = (author ?? '').toString().toLowerCase();

        const articlesFromAuthour = searchFunctions
            .map((findArticle) => findArticle(searchTerm, articles))
            .flat();

        articlesFromAuthour.forEach(
            (article) => (article.innerHTML = `<!--${searchTerm} removed-->`)
        );
    }

    /**
     * Searches using author name
     * @param {string} authorName Author name
     * @param {HTMLElement[]} allArticles list of all articles on the page
     */
    function searchByAuthorName(authorName, allArticles) {
        const articles = allArticles.filter((article) =>
            equalsCaseInsensetive(
                article.querySelector(`.user-info__nickname`)?.textContent,
                authorName
            )
        );

        log(`Found ${articles.length} articles from author ${authorName}`);

        return articles;
    }

    /**
     * Searches using author name
     * @param {string} blogName Blog name
     * @param {HTMLElement[]} allArticles list of all articles on the page
     */
    function searchByBlogName(blogName, allArticles) {
        const articles = allArticles.filter((article) =>
            article
                .querySelector(`.post__title a`)
                ?.href.toLowerCase()
                ?.includes(`/company/${blogName}`)
        );

        log(`Found ${articles.length} articles from blog ${blogName}`);

        return articles;
    }

    const banned = await getListOfBanned();

    log(`Found list of banned users: ${banned.map((x) => x.name).join(',')} `);
    const [...allArticles] = document.querySelectorAll('article:not(.post_full)');

    banned.forEach(({ name }) =>
        removeArticle(name, allArticles, [searchByAuthorName, searchByBlogName])
    );

    log(`Sanitization done`);
})();
