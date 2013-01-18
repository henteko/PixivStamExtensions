var BASE_URL = "http://henteko07.com:4000";
var script = function(){
    jQuery('<div>', {
        id:'toPixivData', 
        'data-pixivuser':JSON.stringify(pixiv.user), 
        'data-pixivcontext':JSON.stringify(pixiv.context), 
        style:'display:none;'
    }).appendTo(jQuery('body'));
};

$(document).ready(function () {
    location.href = 'javascript:('+script.toString()+')()';

    setTimeout(function () {
        var pixiv_user = $.parseJSON($("#toPixivData").attr("data-pixivuser"));
        var pixiv_context =  $.parseJSON($("#toPixivData").attr("data-pixivcontext"));

        $.getJSON(BASE_URL + "/stamp_list/", function(data, status) {
            setStampList(data);
        });

        //そのページのスタンプを取得
        $.getJSON(BASE_URL + "/stamp_search/" + pixiv_context.illustId, function(data, status) {
            setStamp(data, false);
        });
        
    }, 100);
});

//既にあるスタンプをセットします
function setStamp(data, new_flag) {
    var $works_display = $("div.works_display");
    var $stamped_list = $("div.stamped_list");
    if($stamped_list.length == 0) {
        $stamped_list = $("<div>", {class: "stamped_list"});
    }
    $.each(data, function(id) {
        var $img = $("<img>", {
            class: "stamped_icon",
            src: data[id].stamp_icon_url
        });
        $stamped_list.append($img);
    });
    $works_display.append($stamped_list);
}

//スタンプリストをセットします
function setStampList(data) {
    var $works_display = $("div.works_display");
    var $stamp_list = $("<div>", {class: "stamp_list"});
    $.each(data, function(id) {
        var $img = $("<img>", {
            class: "stamp_icon",
            "stamp_id": data[id].stamp_id,
            src: data[id].stamp_icon_url
        });

        $img.click(function() {
            var pixiv_user = $.parseJSON($("#toPixivData").attr("data-pixivuser"));
            var pixiv_context =  $.parseJSON($("#toPixivData").attr("data-pixivcontext"));

            var url = BASE_URL + 
                "/vote?illust_id=" + pixiv_context.illustId + 
                "&stamp_id=" + $(this).attr("stamp_id"); 
            var self = this;
            $.getJSON(url, function(data, status) {
                if(data.success == true) {
                    var new_data = [{"stamp_icon_url": $(self).attr("src")}];
                    setStamp(new_data, true);
                }
            });
        });

        $stamp_list.append($img);
    });
    $works_display.append($stamp_list);
}
