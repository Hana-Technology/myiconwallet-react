// source: https://gist.github.com/rproenca/64781c6a1329b48a455b645d361a9aa3
export function copyToClipboard(text) {
  const IS_IOS = navigator.userAgent.match(/ipad|iphone/i);

  // create a textarea
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.readOnly = true;
  document.body.appendChild(textArea);

  // select the text
  if (IS_IOS) {
    let range = document.createRange();
    range.selectNodeContents(textArea);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, 999999);
  } else {
    textArea.select();
  }

  // copy the text
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
