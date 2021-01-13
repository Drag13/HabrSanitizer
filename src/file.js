/**
 * Saves object as a file from browser
 * @param {Object} data Object to save to the file
 * @param {string} fileName Name of the file to save
 */
export function saveToFile(data, fileName) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';

    const json = JSON.stringify(data, null, 4);
    const blob = new Blob([json], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
