export class Storage {
    _handler;

    async getSettings() {
        const settings = await this._loadSettings();
        return settings;
    }

    async applySettings(settings) {
        if (!settings || !settings.banned || !Array.isArray(settings.banned)) {
            throw new Error('Settings formatted incorrectly');
        }
        this._saveSettings(settings);
        this._notify(settings);
    }

    /**
     * Add author to ban list
     * @param {{name:string}} author author object
     */
    async addNewBan(author) {
        if (author == null) {
            return;
        }

        const settings = await this._loadSettings();
        const exists = !!settings.banned.find((x) => this._eq(x.name, author.name));

        if (exists) {
            return false;
        }

        settings.banned.push(author);
        await this._saveSettings(settings);
        this._notify(settings);

        return true;
    }

    /**
     * Removes author from banlist
     * @param {string} userName name of the author
     */
    async removeFromBan(userName) {
        if (this._null(userName)) {
            return;
        }

        const settings = await this._loadSettings();
        settings.banned = settings.banned.filter((author) => !this._eq(author.name, userName));

        await this._saveSettings(settings);
        this._notify(settings);
    }

    /**
     * Update and save various options
     * @param {boolean} isQuickActionsOn is quick actions available
     */
    async setQuickActionsFlag(isQuickActionsOn) {
        const settings = await this._loadSettings();
        settings.isQuickActionsOn = isQuickActionsOn;
        await this._saveSettings(settings);
    }

    /**
     * @returns {Promise<{banned:[], isQuickActionsOn:boolean, isPopularIgnored:boolean>}
     */
    async _loadSettings() {
        return new Promise((res, _) => {
            chrome.storage.sync.get('settings', (data) => res(data && data.settings ? data.settings : { banned: [] }));
        });
    }

    async _saveSettings(settings) {
        return new Promise((res, _) => {
            chrome.storage.sync.set({ settings }, res);
        });
    }

    /**
     * Subscribe to settings change
     * @param {(settings)=> void} handler
     */
    onChange(handler) {
        this._handler = handler;
    }

    _notify = (settings) => {
        typeof this._handler === 'function' && this._handler(settings);
    };

    _eq = (v1, v2) => (v1 || '').toString().toLowerCase() === (v2 || '').toString().toLowerCase();

    _null = (v) => v == null || v === '';
}
