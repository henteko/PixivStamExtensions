chrome.extension.onMessage.addListener(function(req, sender) {
    var win = window.open("stamp_info.html?" + JSON.stringify(req));
    win.focus();
});
