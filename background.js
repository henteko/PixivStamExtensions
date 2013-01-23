chrome.extension.onMessage.addListener(function(req, sender) {
    var win = window.open("stamp_info.html?" + JSON.stringify(req));
    win.focus();
});

//あとで使う正規表現パターンを作っておく
var re = /^http:\/\/\[a-z0-9]+.pixiv\.net\//i;
//onBeforeSendHeaders(ヘッダを送信する前)イベントリスナを登録
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details){
        //フラグ変数
        var refererFound = false;
        for(var i=0; i<details.requestHeaders.length; i++){
            var header = details.requestHeaders[i];
            if(header.name == "Referer"){
                if(!re.test(header.value)){
                    header.value = "http://www.pixiv.net/";
                }
                refererFound = true;
                break;
            }
        }
        //リファラなしの場合は追加
        if(!refererFound){
            details.requestHeaders.push({
                name: "Referer",
                value: "http://www.pixiv.net/"
            });
        }
        //書き換えたヘッダを返却
        return {requestHeaders:details.requestHeaders};
    },
    {
        urls: [
            "*://*.pixiv.net/*"
        ],
        types:[
            "image",
            "main_frame"
        ]
    },
    [
        "requestHeaders",
        "blocking"
    ]
);
