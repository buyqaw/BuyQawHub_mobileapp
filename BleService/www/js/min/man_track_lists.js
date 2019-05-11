/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var manTL_tracks;
var manTL_setPageParamsHandler = function () {
    $.mobile.loading("show");
    g_pageParams = $(this).attr("data-vr-uuid") ? {
        trackUUID: $(this).attr("data-vr-uuid"),
        adding: false
    } : {
        trackUUID: volunteerRescue.generateUUID(),
        adding: true
    };
    window.sessionStorage.setItem("manTL_pageParams", JSON.stringify(g_pageParams));
    $.mobile.changePage($(this).attr("href"));
    return false
};
var manTL_buildItem = function (a, b) {
    var c, d;
    d = $("<div>").addClass("vr-listview-extras");
    if (a.stoppedAt) {
        d.append($("<div>").html("Stopped at: " + moment(a.stoppedAt).format("LLL")))
    }
    if (a.startedAt) {
        d.prepend($("<div>").html("Started at: " + moment(a.startedAt).format("LLL")));
        if (a.totalDistance > 1000) {
            d.append($("<div>").html("Distance: " + Number(a.totalDistance / 1000).toFixed(4) + "km"))
        } else {
            d.append($("<div>").html("Distance: " + a.totalDistance + "m"))
        }
    }
    if (a.points.length > 0) {
        d.append($("<div>").html("GPS point count: " + a.points.length));
        if (a.serverURL != "-1") {
            d.append($("<div>").html("Connected to server: " + (a.serverToken ? "Yes" : "No")));
            d.append($("<div>").html("Points sent: " + a.serverPointsSent));
            if (a.serverLastSentAt) {
                d.append($("<div>").html("Last sent at: " + moment(a.serverLastSentAt).format("LLL")))
            }
        }
    }
    c = $("<div>").attr("id", "manTL_item_" + b).html(d);
    return c
};
$("#manTL_page").on("pageshow", function () {
    var b = $("#manTL_lstTracks");
    var d;
    var c;
    var f;
    var e = null;
    var a = true;
    vr_device.googleAnalytics();
    window.sessionStorage.setItem("lastNavOption", "man_track_lists.html");
    $("img#manTL_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    $(b).empty();
    manTL_tracks = vr_device.localStorage.getItem("manGPSTracks");
    if (vr_device.supportGPSTracker == false) {
        $("#manTL_btnAddTrackList").css("display", "none")
    }
    if (manTL_tracks && manTL_tracks != "{}") {
        manTL_tracks = JSON.parse(manTL_tracks);
        f = vr_device.localStorage.getItem("manGPSCurrentTrack");
        if (f) {
            f = JSON.parse(f);
            e = f.trackUUID
        }
        for (d in manTL_tracks) {
            if (f && d == f.trackUUID) {
                a = false
            }
            c = manTL_buildItem(manTL_tracks[d], d);
            $(b).append($("<li>").append($("<a>").attr("href", "man_track_view.html").attr("data-vr-uuid", d).click(manTL_setPageParamsHandler).append($("<img>").addClass("ui-li-icon").attr({
                id: "manTL_track_img" + d,
                src: g_basePath + "images/" + (f && f.trackUUID == d ? "correct-16.png" : "incorrect-16.png")
            })).append($("<div>").append($("<div>").html(manTL_tracks[d].description)).append(c))).append($("<a>").attr("href", "man_track_edit.html").attr("data-vr-uuid", d).click(manTL_setPageParamsHandler)))
        }
    } else {
        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify({}));
        $(b).append("<li>You have not created any tracks.</li>")
    }
    $(b).listview("refresh");
    if (a == true) {
        vr_device.localStorage.removeItem("manGPSCurrentTrack")
    }
    $("#manTL_btnAddTrackList").click(manTL_setPageParamsHandler)
});