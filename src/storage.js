/** @typedef {{banned:Array<{name:string, disabled: boolean}>,isQuickActionsOn: boolean}} SanitizerSettings */

/**
 * Check equality for nullable string ignoring case
 * @param {string} v1 First string
 * @param {string} v2 Second string
 * @return {boolean} Is strings equals ignoring case
 */
const isEquals = (v1, v2) => (v1 || '').toString().toLowerCase() === (v2 || '').toString().toLowerCase();

/**
 * Checks if string is null or empty
 * @param {string} v String to check
 * @return {boolean} is string null or empty
 */
const isNull = (v) => v == null || v === '';

/**
 * Persistent storage for the user settings
 */
export class Storage {

    /**
     * Push new settings to the storage (overrides all)
     * @param {SanitizerSettings} settings
     */
    async applySettings(settings) {
        if (!settings || !settings.banned || !Array.isArray(settings.banned)) {
            throw new Error('Settings formatted incorrectly');
        }
        return this._saveSettings(settings);
    }

    /**
     * Add author to ban list
     * @param {{name:string}} author author object
     */
    async addNewBan(author) {
        if (author == null) {
            return;
        }

        const settings = await this.loadSettings();
        const exists = !!settings.banned.find((x) => isEquals(x.name, author.name));

        if (exists) {
            return false;
        }

        settings.banned.push(author);
        await this._saveSettings(settings);

        return true;
    }

    /**
     * Removes author from banlist
     * @param {string} userName name of the author
     */
    async removeFromBan(userName) {
        if (isNull(userName)) {
            return;
        }

        const settings = await this.loadSettings();
        settings.banned = settings.banned.filter((author) => !isEquals(author.name, userName));

        return this._saveSettings(settings);
    }

    /**
     * Update and save various options
     * @param {boolean} isQuickActionsOn is quick actions available
     */
    async setQuickActionsFlag(isQuickActionsOn) {
        const settings = await this.loadSettings();
        settings.isQuickActionsOn = isQuickActionsOn;
        return this._saveSettings(settings);
    }

    /**
     * Update and save list view mode
     * @param {integer} mode
     * @return {Promise} promise
     */
    async setListViewMode(mode) {
        const settings = await this.loadSettings();
        settings.listViewMode = mode;
        return this._saveSettings(settings);
    }

    /**
     * Subscribe to settings change event, watched by settings key
     * @param {string} key
     * @param {Function} handler
     */
    onSettingsChange(key, handler) {
        chrome.storage.onChanged.addListener((changes) => {
            const nv = changes.settings.newValue?.[key];
            const ov = changes.settings.oldValue?.[key];
            if ( JSON.stringify(nv) !== JSON.stringify(ov) ) {
                handler(nv, ov);
            }
        });
    }

    /**
     * Get all settings
     * @return {Promise} user settings
     */
    async loadSettings() {
        return new Promise((res, _) => {
            chrome.storage.sync.get('settings', (data) => res(data && data.settings ? data.settings : { banned: [] }));
        });
    }

    /**
     * Private
     * @param {SanitizerSettings} settings
     */
    async _saveSettings(settings) {
        return new Promise((res, _) => {
            chrome.storage.sync.set({ settings }, res);
        });
    }
}
