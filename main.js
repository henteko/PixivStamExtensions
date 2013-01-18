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
        var BASE_URL = "http://henteko07.com:4000";

        //そのページのスタンプを取得
        $.getJSON(BASE_URL + "/stamp_search/" + pixiv_context.illustId, function(data, status) {
            setStamp(data, false);
        });
    }, 100);
});

function setStamp(data, new_flag) {
}

function setIcon(data, new_flag) {
    var $score = $("section.score");
    var $vote_users = $score.find(".vote_user");
    if($vote_users.length == 0) {
        $vote_users = $("<div>", {
            class: "vote_user"
        });
    }

    $.each(data, function(id) {
        var $a = $("<a>", {
            href: "http://www.pixiv.net/member.php?id=" + data[id].user_id,
            class: "ui-tooltip",
            "data-tooltip": data[id].user_name ? data[id].user_name : "名無しさん"
        });
        var $img = $("<img>",{
            id: "rating_user_icon",
            src: data[id].user_icon_url
        });
        $a.append($img);
        if(new_flag) {
            //アニメーション
            $img.animate({ 
                width: "30px",
                height: "30px",
            }, 1000 );
            $vote_users.prepend($a);
        }else {
            $img.css("width", "30px").css("height", "30px");
            $vote_users.append($a);
        }
    });
    $score.append($vote_users);
}
