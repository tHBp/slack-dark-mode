const cssPath = chrome.runtime.getURL("override.css");
let cssPromise = fetch(cssPath).then(response => response.text());

const applyDarkMode = () => {
   cssPromise.then(css => {
      let s = document.createElement("style");
      s.type = "text/css";
      s.innerHTML = css;
      s.setAttribute("isSlackDarkMode", "true");
      document.head.appendChild(s);
   });
}

const togglePageState = () => {
   const element = document.querySelector("style[isSlackDarkMode='true']");
   if (element) {
      element.parentNode.removeChild(element);
   } else {
      applyDarkMode();
   }
   return !element;
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
   const currentState = togglePageState();
   sendResponse(currentState);
   chrome.storage.sync.set({
      isSlackDarkMode: currentState
   });
});

chrome.extension.sendMessage({
   type: "newTabOpened"
});

chrome.storage.sync.get(["isSlackDarkMode"], storage => storage.isSlackDarkMode ? (applyDarkMode(), chrome.extension.sendMessage({
   type: "applyDarkMode"
})) : null);