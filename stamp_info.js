$(function() {
    var $json = jsonParse(location.search);
    setImage($json.stamp[0].stamp_icon_url, "stamp", ".stamp_area");

    //重複削除の処理してます
    var count = 0;
    var illusts_id = new Array();
    illusts_id[count] = $json.illusts[count].illust_id;
    count++;
    $.each($json.illusts, function(id) {
        var flag = true;
        var illust_id = $json.illusts[id].illust_id;
        $.each(illusts_id, function(id) {
            if(illust_id == illusts_id[id]){
                flag = false;
            } 
        });

        if(flag) {
            illusts_id[count] = illust_id; 
            count++;
        }
    });

    $.each(illusts_id, function(id) {
        setIllustImage(illusts_id[id]);
    });
});

function setImage(url, class_name, search) {
    var $img = $("<img>", {
        class: class_name,
        src: url
    });
    $(search).append($img);
}

function setIllustImage(illust_id) {
    var url = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + illust_id;
    $.get(url, function(data) {
        var $li = $("<li>");
        var $a = $("<a>", {
            target: "_blank",
            href: url
        });
        var $illust_img = $(data).find(".works_display").find("img");
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

        $illust_img.attr("src", mobile_url);

        $illust_img.attr("class", "illust");
        $a.append($illust_img);
        $a.append($("<p>").append($illust_img.attr("title")));

        $li.append($a);
        $(".illust_area").find("ul").append($li);
    });
}

function jsonParse(string) {
    var json = string;
    json = json.replace("?","");
    json = decodeURI(json);
    var _json = JSON.parse(json);

    return _json;
}
