const cssPath = "https://raw.githubusercontent.com/tHBp/slack-dark-mode/master/override.css";
let cssPromise = fetch(cssPath).then(response => response.text());

const applyDarkMode = () => {
   cssPromise.then(css => {
      let s = document.createElement("style");
      s.type = "text/css";
      s.innerHTML = css;
      s.setAttribute("isOverride", "true");
      document.head.appendChild(s);
   });
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
   const element = document.querySelector("style[isOverride='true']");

   if (element) {
      element.parentNode.removeChild(element);
   } else {
      applyDarkMode();
   }

   sendResponse(element ? "light" : "dark");
});