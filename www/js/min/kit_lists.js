/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var kitL_lists;
var kitL_setPageParamsHandler = function () {
    g_pageParams = $(this).attr("data-vr-uuid") ? {
        kitUUID: $(this).attr("data-vr-uuid"),
        adding: false
    } : {
        kitUUID: volunteerRescue.generateUUID(),
        adding: true
    };
    window.sessionStorage.setItem("kitL_pageParams", JSON.stringify(g_pageParams));
    $.mobile.changePage($(this).attr("href"));
    return false
};
$("#kitL_page").on("pageshow", function () {
    var d = $("#kitL_lstKits");
    var b;
    var a;
    var c;
    var e;
    vr_device.googleAnalytics();
    window.sessionStorage.setItem("lastNavOption", "kit_lists.html");
    $("img#kitL_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    $(d).empty();
    kitL_lists = vr_device.localStorage.getItem("kitLists");
    e = null;
    if (kitL_lists && kitL_lists != "{}") {
        kitL_lists = JSON.parse(kitL_lists);
        for (b in kitL_lists) {
            if (kitL_lists[b].location != e) {
                e = kitL_lists[b].location;
                $(d).append($("<li>", {
                    "data-role": "list-divider",
                    "data-theme": "b",
                    text: e
                }))
            }
            a = $("<div>").append($("<div>").html(kitL_lists[b].description)).append($("<span>").addClass("ui-li-count").text(kitL_lists[b].items.length + " items"));
            c = $("<div>").addClass("vr-listview-extras");
            if (kitL_lists[b].notes != "") {
                c.append($("<div>").html(kitL_lists[b].notes.replace(/\n/g, "<br />")))
            }
            $(d).append($("<li>").append($("<a>").attr("href", "kit_list_items.html").attr("data-vr-uuid", b).click(kitL_setPageParamsHandler).append(a.append(c))).append($("<a>").attr("href", "kit_list_edit.html").attr("data-vr-uuid", b).click(kitL_setPageParamsHandler)))
        }
    } else {
        vr_device.localStorage.setItem("kitLists", JSON.stringify({}));
        $(d).append("<li>You have not created any kit lists.</li>")
    }
    $(d).listview("refresh");
    $("#kitL_btnAddKitList").click(kitL_setPageParamsHandler)
});