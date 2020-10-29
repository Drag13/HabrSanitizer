export function saveToFile(data, fileName) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";

  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
