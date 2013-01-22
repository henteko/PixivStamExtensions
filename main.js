var BASE_URL = "http://henteko07.com:4000";
var USER_PAGE_URL = "http://www.pixiv.net/member.php?id=";
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

        var $stamp = $("<div>", {
            class: "stamp"
        });
        $(".works_display").after($stamp);

        var $stamp_list_button = $("<div>",{
            class: "ui-button",
            id: "stamp_list_button"
        });
        $stamp_list_button.text("スタンプを投げる");
        $stamp.append($stamp_list_button);
        
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
    var $stamped_list = $("div.stamped_list");
    if($stamped_list.length == 0) {
        $stamped_list = $("<div>", {class: "stamped_list"});
    }
    $.each(data, function(id) {
        var $user_stamped = $("<span>", {
            class: "user_stamped"
        });

        var $user_icon = $("<a>", {
            class: "stamp_user_icon",
            href: USER_PAGE_URL + data[id].user_id
        });
        //ユーザーアイコンの表示
        var $user_icon_img = $("<img>", {
            class: "ui-tooltip",
            "data-tooltip": data[id].user_name ? data[id].user_name : "名無しさん",
            src: data[id].user_icon_url
        });
        $user_icon.append($user_icon_img);

        var $stamp_link = $("<a>", {
            class: "stamped_icon"
        });
        var $img = $("<img>", {
            src: data[id].stamp.stamp_icon_url,
            "stamp_id": data[id].stamp.stamp_id
        });
        $stamp_link.append($img);

        $stamp_link.click(function() {
            //stamp個別ページへ
            var stamp_id = $(this).children("img").attr("stamp_id");
            $.getJSON(BASE_URL + "/stamp_info/" + stamp_id, function(data, status) {
                chrome.extension.sendMessage(data, function(res) {
                    console.log(res);
                });
            });
        });

        $user_stamped.append($stamp_link);
        $user_stamped.append($user_icon);

        if(new_flag) {
            var $stamp_plus = $("#stamp_plus");
            $stamp_plus.after($user_stamped);
        }else {
            $stamped_list.prepend($user_stamped);
        }
    });

    if(!new_flag) {
        //+エリアの設定
        var $user_stamped = $("<span>", {
            class: "user_stamped",
            id: "stamp_plus"
        });
        var $plus = $("<img>", {
            src: "http://henteko07.com/pixiv_stamp/plus.png"
        });
        $user_stamped.append($plus);
        $stamped_list.prepend($user_stamped);
    }

    $("div.stamp").append($stamped_list);
}

//スタンプリストをセットします
function setStampList(data) {
    var $stamp_list_button = $("#stamp_list_button");
       
    var $stamp_list = $("<div>", {class: "stamp_list"});
    $stamp_list_button.after($stamp_list);

    var $list = $("<div>", {class: "list"});
    $.each(data, function(id) {
        var $img = $("<img>", {
            class: "stamp_icon",
            "stamp_id": data[id].stamp_id,
            src: data[id].stamp_icon_url
        });

        $img.click(function() {
            var pixiv_user = $.parseJSON($("#toPixivData").attr("data-pixivuser"));
            var pixiv_context =  $.parseJSON($("#toPixivData").attr("data-pixivcontext"));

            var self = this;
            if(pixiv_user.loggedIn == true) {
                //スタンプを投稿する
                postStamp(pixiv_user, pixiv_context, self); 
            }
        });
        $list.append($img);
    });

    $stamp_list.append($list);
    $stamp_list.css("display", "none");

    $stamp_list_button.after($stamp_list);
    $stamp_list_button.click(function() {
        $stamp_list.slideDown("slow");
        $stamp_list_button.css("display", "none");
    });
}

//スタンプを投稿します
function postStamp(pixiv_user, pixiv_context, self) {
    var user_url = USER_PAGE_URL + pixiv_user.id;
    $.get(user_url, function(data) {
        var img = $(data).find(".profile_area img")[0];
        var img_url = $(img).attr("src");
        var user_name = $(data).find(".profile_area h2").text();
        var url = BASE_URL + 
            "/vote?illust_id=" + pixiv_context.illustId + 
            "&user_id=" + pixiv_user.id + 
            "&point=" + 10 + 
            "&user_icon_url=" + img_url + 
            "&user_name=" + user_name +
            "&stamp_id=" + $(self).attr("stamp_id"); 

        $.get(url, function(data) {
            if(data.success == true) {
                var new_data = [{
                    "user_icon_url": img_url, 
                    "user_id": pixiv_user.id,
                    "user_name": user_name,
                    "stamp": {"stamp_icon_url": $(self).attr("src"), "stamp_id": $(self).attr("stamp_id")}
                }];
                setStamp(new_data, true);
                alert("スタンプを投稿しました");
            }
        });
    });
}
