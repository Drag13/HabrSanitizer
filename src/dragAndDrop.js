export class DnD {
  _ref;
  constructor(selector) {
    this._ref = document.querySelector(selector);
    if (!this._ref) {
      throw new Error(`Element with selector ${selector} not found`);
    }

    this._ref.addEventListener("dragover", (event) => {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
  }

  onFileDropped(callback) {
    this._ref.addEventListener("drop", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const fileList = event.dataTransfer.files;

      const reader = new FileReader();

      reader.addEventListener("loadend", (event) => {
        const content = JSON.parse(event.target.result);
        callback(content);
      });

      reader.readAsText(fileList[0]);
    });
  }
}
