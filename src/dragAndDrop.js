/**
 * Wrapper for the Drag&Drop
 */
export class DnD {
    /**
     * Creates Drag&Drop interface for element
     * @param {string} selector Selector to be attach to
     */
    constructor(selector) {
        this._ref = document.querySelector(selector);
        if (!this._ref) {
            throw new Error(`Element with selector ${selector} not found`);
        }

        this._ref.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });
    }

    /**
     * Subscribes to event when file loaded by DnD
     * @param {Function<any>} callback Handler to receive data from the DnD
     */
    onFileDropped(callback) {
        this._ref.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            const fileList = event.dataTransfer.files;

            const reader = new FileReader();

            reader.addEventListener('loadend', (event) => {
                const content = JSON.parse(event.target.result);
                callback(content);
            });

            reader.readAsText(fileList[0]);
        });
    }
}
