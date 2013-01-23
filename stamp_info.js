$(function() {
    var $json = jsonParse(location.search);
    setImage($json.stamp[0].stamp_icon_url, "stamp", ".stamp_area");

    //重複削除の処理してます
    var count = 0;
    var illusts_id = new Array();
    var illusts_url = new Array();
    var illusts_title = new Array();
    illusts_id[count] = $json.illusts[count].illust_id;
    illusts_url[count] = $json.illusts[count].illust_url;
    illusts_title[count] = $json.illusts[count].illust_title;
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
            illusts_url[count] = $json.illusts[id].illust_url;
            illusts_title[count] = $json.illusts[id].illust_title;
            count++;
        }
    });

    $.each(illusts_id, function(id) {
        setIllustImage(illusts_id[id], illusts_url[id], illusts_title[id]);
    });
});

function setImage(url, class_name, search) {
    var $img = $("<img>", {
        class: class_name,
        src: url
    });
    $(search).append($img);
}

function setIllustImage(illust_id, url, title) {
        var $li = $("<li>");
        var $a = $("<a>", {
            target: "_blank",
            href: "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + illust_id
        });

        var $illust_img = $("<img>", {
            class: "illust",
            src: url,
            alt: title,
            title: title,
            border: 0
        });

        $a.append($illust_img);
        $a.append($("<p>").append(title));

        $li.append($a);
        $(".illust_area").find("ul").append($li);

}

function jsonParse(string) {
    var json = string;
    json = json.replace("?","");
    json = decodeURI(json);
    var _json = JSON.parse(json);

    return _json;
}
