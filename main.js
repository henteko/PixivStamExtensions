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

        var $stamp_list_button_area = $("<div>", {
            class: "stamp_list_button_area"
        });

        var $stamp_list_button = $("<div>",{
            class: "ui-button",
            id: "stamp_list_button"
        });
        $stamp_list_button.text("スタンプを投稿する");
        $stamp_list_button_area.append($stamp_list_button);

        $stamp.append($stamp_list_button_area);
        
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

    var MAX_STAMP_NUM = 9;
    $.each(data['illusts'], function(id) {
        var $user_stamped = $("<span>", {
            class: "user_stamped"
        });

        var $user_icon = $("<a>", {
            class: "stamp_user_icon",
            href: USER_PAGE_URL + data['illusts'][id].user_id
        });
        //ユーザーアイコンの表示
        var $user_icon_img = $("<img>", {
            class: "ui-tooltip",
            "data-tooltip": data['illusts'][id].user_name ? data['illusts'][id].user_name : "名無しさん",
            src: data['illusts'][id].user_icon_url
        });
        $user_icon.append($user_icon_img);

        var $stamp_link = $("<a>", {
            class: "stamped_icon"
        });
        var $img = $("<img>", {
            class: "ui-tooltip",
            "data-tooltip": "スタンプ情報へ",
            src: data['illusts'][id].stamp.stamp_icon_url,
            "stamp_id": data['illusts'][id].stamp.stamp_id
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
            //新しいスタンプ設置時は、＋エリアの後ろに追加
            var $stamp_plus = $("#stamp_plus");

            //ここからアニメーションの設定
            $user_stamped.css("opacity", 0);
            $user_stamped.css("zoom", 1.5);
            $user_stamped.css("position", "absolute");

            var $delete_user_icon = $("<a>", {
                class: "stamp_user_icon",
                href: USER_PAGE_URL + data['illusts'][id].user_id
            });
            var $delete_user_icon_img = $("<img>", {
                class: "ui-tooltip",
                "data-tooltip": data['illusts'][id].user_name ? data['illusts'][id].user_name : "名無しさん",
                src: data['illusts'][id].user_icon_url
            });
            $delete_user_icon.append($delete_user_icon_img);

            var $delete_stamp_link = $("<a>", {
                class: "stamped_icon"
            });
            var $delete_img = $("<img>", {
                class: "ui-tooltip",
                "data-tooltip": "スタンプ情報へ",
                src: data['illusts'][id].stamp.stamp_icon_url,
                "stamp_id": data['illusts'][id].stamp.stamp_id
            });
            $delete_stamp_link.append($delete_img);

            var $delete_user_stamped = $("<span>", {
                class: "user_stamped",
                id: "delete_area"
            });
            $delete_user_stamped.css("opacity", 0);
            $delete_user_stamped.append($delete_stamp_link);
            $delete_user_stamped.append($delete_user_icon);

            $stamp_plus.after($delete_user_stamped);
            $stamp_plus.after($user_stamped);

            $user_stamped.animate({
                opacity: 1,
                zoom: 1
            }, 100, function() {
                $("#delete_area").remove();
                $(this).css("position", "relative");
            });

        }else {
            $stamped_list.append($user_stamped);
        }

        if(MAX_STAMP_NUM <= id) {
            $user_stamped.css("display", "none");
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

        $user_stamped.css("display", "none"); //最初は非表示
        $user_stamped.append($plus);
        $stamped_list.prepend($user_stamped);

        $("div.stamp").append($stamped_list);
    }

    if(data['max_flag']) {
        //全てのスタンプを表示出来ないとき、全てのスタンプを見るボタンの追加
        var $show_stamp = $("<div>",{
            class: "ui-button",
            id: "show_stamp"
        });
        $show_stamp.text("全てのスタンプを見る");
        var $show_stamp_area =  $("<div>", {
            class: "show_stamp_area"
        });
        $show_stamp_area.append($show_stamp);
        $stamped_list.after($show_stamp_area);

        $show_stamp.click(function() {
            var $user_stampeds = $(".user_stamped");
            $.each($user_stampeds, function(id) {
                var $_user_stamped = $($user_stampeds[id]);
                if($_user_stamped.css("display") == "none" && $_user_stamped.attr("id") != "stamp_plus") {
                    $_user_stamped.show(); 
                }
            });
            $(this).hide();
        });
    }

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
        $stamp_list.css("display", "block");
        $("#stamp_plus").show(); //＋エリア表示
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
        "&stamp_id=" + $(self).attr("stamp_id") +
        "&illust_title=" + getIllustTitle() +  
        "&illust_url=" + getIllustMobileURL(); 

        $.get(url, function(data) {
            if(data.success == true) {
                var new_data = {
                    'max_flag': false,
                    'illusts' :[{
                        "user_icon_url": img_url, 
                        "user_id": pixiv_user.id,
                        "user_name": user_name,
                        "stamp": {"stamp_icon_url": $(self).attr("src"), "stamp_id": $(self).attr("stamp_id")}
            }]
                };
                setStamp(new_data, true);
            }
        });
    });
}

function getIllustMobileURL() {
    var $illust_img = $(".works_display").find("img");
    var illust_url = $illust_img.attr("src");
    var url_split = illust_url.split("/");
    var mobile_url = "";
    //mobileの挿入
    $.each(url_split, function(id) {
        mobile_url += url_split[id] + "/";
        if(id == 5) mobile_url += "mobile/"
    });
    mobile_url = mobile_url.replace( /_m/, "_128x128" ); //_m を _128×128 に
    mobile_url = mobile_url.slice(0, -1); //最後の / を削除

    return mobile_url;
}

function getIllustTitle() {
    var $illust_img = $(".works_display").find("img");
    return $illust_img.attr("title");
}
