/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var manTLE_tracks;
var manTLE_saveClickHandler = function (a) {

    var c = volunteerRescue.checkFields(a, "manTLE_");
    var b = null;
    if (c == true) {
        if (g_pageParams.adding == false) {
            b = manTLE_tracks[g_pageParams.trackUUID].distanceFilter;
            manTLE_tracks[g_pageParams.trackUUID] = {
                description: $("#manTLE_description").val(),
                distanceFilter: $("#manTLE_distance_filter").val() > 0 ? Math.ceil($("#manTLE_distance_filter").val()) : 20,
                trackFor: $("#manTLE_track_for").val() > 0 ? Math.ceil($("#manTLE_track_for").val()) : 4,
                maximumAccuracy: $("#manTLE_maximum_accuracy").val() > 0 ? Math.ceil($("#manTLE_maximum_accuracy").val()) : 100,
                serverURL: $("#manTLE_server_url").val() && $("#manTLE_server_url").val() != "-1" ? $("#manTLE_server_url").val() : "-1",
                serverInterval: $("#manTLE_server_interval").val() > 0 ? Math.ceil($("#manTLE_server_interval").val()) : 5,
                showDD: $("#manTLE_show_coordinates_DD").prop("checked"),
                showDMS: $("#manTLE_show_coordinates_DMS").prop("checked"),
                showDDM: $("#manTLE_show_coordinates_DDM").prop("checked"),
                showUTM: $("#manTLE_show_coordinates_UTM").prop("checked"),
                serverToken: manTLE_tracks[g_pageParams.trackUUID].serverToken,
                serverLastSentAt: manTLE_tracks[g_pageParams.trackUUID].serverLastSentAt,
                serverPointsSent: manTLE_tracks[g_pageParams.trackUUID].serverPointsSent,
                startedAt: manTLE_tracks[g_pageParams.trackUUID].startedAt,
                stoppedAt: manTLE_tracks[g_pageParams.trackUUID].stoppedAt,
                points: manTLE_tracks[g_pageParams.trackUUID].points,
                totalDistance: manTLE_tracks[g_pageParams.trackUUID].totalDistance
            }
        } else {
            manTLE_tracks[g_pageParams.trackUUID] = {
                description: $("#manTLE_description").val(),
                distanceFilter: $("#manTLE_distance_filter").val() > 0 ? Math.ceil($("#manTLE_distance_filter").val()) : 20,
                trackFor: $("#manTLE_track_for").val() > 0 ? Math.ceil($("#manTLE_track_for").val()) : 4,
                maximumAccuracy: $("#manTLE_maximum_accuracy").val() > 0 ? Math.ceil($("#manTLE_maximum_accuracy").val()) : 100,
                serverURL: $("#manTLE_server_url").val() && $("#manTLE_server_url").val() != "-1" ? $("#manTLE_server_url").val() : "-1",
                serverInterval: $("#manTLE_server_interval").val() > 0 ? Math.ceil($("#manTLE_server_interval").val()) : 5,
                showDD: $("#manTLE_show_coordinates_DD").prop("checked"),
                showDMS: $("#manTLE_show_coordinates_DMS").prop("checked"),
                showDDM: $("#manTLE_show_coordinates_DDM").prop("checked"),
                showUTM: $("#manTLE_show_coordinates_UTM").prop("checked"),
                serverToken: null,
                serverLastSentAt: null,
                serverPointsSent: 0,
                startedAt: null,
                stoppedAt: null,
                points: [],
                totalDistance: 0
            }
        }
        manTLE_tracks = volunteerRescue.sortAssociative(manTLE_tracks);
        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLE_tracks));
        
        if (b && b != manTLE_tracks[g_pageParams.trackUUID].distanceFilter) {
            var d = vr_device.localStorage.getItem("manGPSCurrentTrack");
            if (d) {
                d = JSON.parse(d);
                if (d.trackUUID == g_pageParams.trackUUID) {
                    vr_device.stopTracking(d);
                    d.trackId = null;
                    d.distanceFilter = manTLE_tracks[g_pageParams.trackUUID].distanceFilter;
                    vr_device.startTracking(d);

                    console.log();
                    vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(d))
                }
            }
        }
        window.history.back()
    }
    return false
};

var manTLE_auto_saveClickHandler = function (a) {

    var c = volunteerRescue.checkFields(a, "manTLE_");
    var b = null;
    var today = new Date();

    if (c == true) {
        if (g_pageParams.adding == true) {
            manTLE_tracks[g_pageParams.trackUUID] = {
                description: today,
                distanceFilter: 10,
                trackFor: 240,
                maximumAccuracy: 100,
                serverURL: "Southeastern Search and Rescue",
                serverInterval: 5,
                showDD: true,
                showDMS: true,
                showDDM: true,
                showUTM: true,
                serverToken: null,
                serverLastSentAt: null,
                serverPointsSent: 0,
                startedAt: null,
                stoppedAt: null,
                points: [],
                totalDistance: 0
            }
        } 

        manTLE_tracks = volunteerRescue.sortAssociative(manTLE_tracks);
        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLE_tracks));
        if (b && b != manTLE_tracks[g_pageParams.trackUUID].distanceFilter) {
            var d = vr_device.localStorage.getItem("manGPSCurrentTrack");
            if (d) {
                d = JSON.parse(d);
                if (d.trackUUID == g_pageParams.trackUUID) {
                    vr_device.stopTracking(d);
                    d.trackId = null;
                    d.distanceFilter = manTLE_tracks[g_pageParams.trackUUID].distanceFilter;
                    vr_device.startTracking(d);
                    vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(d))
                }
            }
        }
        window.history.back()
    }
    return false
};


var manTLE_deleteClickHandler = function () {
    volunteerRescue.confirmationDialog("Are you sure you want to delete the track from the list ?", function () {
        var a = vr_device.localStorage.getItem("manGPSCurrentTrack");
        delete manTLE_tracks[g_pageParams.trackUUID];
        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLE_tracks));
        if (a) {
            a = JSON.parse(a);
            if (a.trackUUID == g_pageParams.trackUUID) {
                vr_device.stopTracking(a);
                vr_device.localStorage.removeItem("manGPSCurrentTrack")
            }
        }
        window.history.back()
    }, function () {});
    return false
};
$("#manTLE_page").on("pageshow", function () {
    var b = {
        description: {
            value: "",
            required: true
        },
        distance_filter: {
            value: 20,
            required: true
        },
        track_for: {
            value: 4,
            required: true
        },
        maximum_accuracy: {
            value: 100,
            required: true
        },
        server_interval: {
            value: 5,
            required: false
        },
        server_url: {
            value: -1,
            options: {},
            required: false
        },
        show_coordinates_DD: {
            checked: true,
            required: false
        },
        show_coordinates_DMS: {
            checked: true,
            required: false
        },
        show_coordinates_DDM: {
            checked: true,
            required: false
        },
        show_coordinates_UTM: {
            checked: true,
            required: false
        }
    };
    b.server_url.options["-1"] = "<No>";
    for (var a in volunteerRescue.sites) {
        b.server_url.options[a] = volunteerRescue.sites[a].description
    }
    vr_device.googleAnalytics();
    g_pageParams = JSON.parse(window.sessionStorage.getItem("manTL_pageParams"));
    manTLE_tracks = vr_device.localStorage.getItem("manGPSTracks");
    if (manTLE_tracks) {
        manTLE_tracks = JSON.parse(manTLE_tracks)
    }
    if (!manTLE_tracks || (g_pageParams.adding == false && !manTLE_tracks[g_pageParams.trackUUID])) {
        window.history.back()
    }
    $("img#manTLE_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    if (g_pageParams.adding == false) {
        b.description.value = manTLE_tracks[g_pageParams.trackUUID].description;
        b.distance_filter.value = manTLE_tracks[g_pageParams.trackUUID].distanceFilter;
        b.track_for.value = manTLE_tracks[g_pageParams.trackUUID].trackFor;
        b.server_interval.value = manTLE_tracks[g_pageParams.trackUUID].serverInterval;
        b.maximum_accuracy.value = manTLE_tracks[g_pageParams.trackUUID].maximumAccuracy;
        b.server_url.value = manTLE_tracks[g_pageParams.trackUUID].serverURL;
        b.show_coordinates_DD.checked = manTLE_tracks[g_pageParams.trackUUID].showDD;
        b.show_coordinates_DMS.checked = manTLE_tracks[g_pageParams.trackUUID].showDMS;
        b.show_coordinates_DDM.checked = manTLE_tracks[g_pageParams.trackUUID].showDDM;
        b.show_coordinates_UTM.checked = manTLE_tracks[g_pageParams.trackUUID].showUTM;
        if (!$.isArray(g_settings.websiteURL) || g_settings.websiteURL.length == 0) {
            $("#manTLE_divServerInterval").css("display", "none")
        } else {
            $("#manTLE_divServerInterval").css("display", manTLE_tracks[g_pageParams.trackUUID].serverURL != "-1" ? "block" : "none")
        }
        $("#manTLE_deleteForm").css("display", "inline-block")
    } else {
        $("#manTLE_divServerInterval").css("display", "none");
        $("#manTLE_deleteForm").css("display", "none")
    }
    volunteerRescue.populateFields(b, "manTLE_");
    if (!$.isArray(g_settings.websiteURL) || g_settings.websiteURL.length == 0) {
        $("#manTLE_server_url").prop("disabled", true);
        $("#manTLE_helpRealTime").text("This feature is only available with a central VolunteerRescue installation.  If the organization you are a member of uses the main VolunteerRescue service please enter the URL to the organization's VolunteerRescue service in the settings to enable this field.")
    }
    $("#manTLE_server_url").selectmenu("refresh", true);
    $("#manTLE_show_coordinates_DD").checkboxradio("refresh", true);
    $("#manTLE_show_coordinates_DMS").checkboxradio("refresh", true);
    $("#manTLE_show_coordinates_DDM").checkboxradio("refresh", true);
    $("#manTLE_show_coordinates_UTM").checkboxradio("refresh", true);
    $("#manTLE_deleteForm").off("click", manTLE_deleteClickHandler).on("click", manTLE_deleteClickHandler);
    $("#manTLE_submitForm").off("click", manTLE_saveClickHandler).on("click", {
        apiResponse: b
    }, manTLE_saveClickHandler);

    $("#manTLE_form").submit({
        apiResponse: b
    }, manTLE_saveClickHandler);

    $('[name="manTLE_server_url"]').change(function () {
        $("#manTLE_divServerInterval").css("display", $("#manTLE_server_url").val() != -1 ? "block" : "none")
    })
});