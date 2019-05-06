/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var kitLE_lists;
var kitLE_saveClickHandler = function (a) {
    var b = volunteerRescue.checkFields(a, "kitLE_");
    if (b == true) {
        kitLE_lists[g_pageParams.kitUUID] = {
            description: $("#kitLE_description").val(),
            location: $("#kitLE_location").val(),
            notes: $("#kitLE_notes").val(),
            items: (g_pageParams.adding == false ? kitLE_lists[g_pageParams.kitUUID].items : []),
            locked: (g_pageParams.adding == false ? kitLE_lists[g_pageParams.kitUUID].locked : false)
        };
        kitLE_lists = volunteerRescue.sortAssociative(kitLE_lists);
        vr_device.localStorage.setItem("kitLists", JSON.stringify(kitLE_lists));
        window.history.back()
    }
    return false
};
var kitLE_deleteClickHandler = function () {
    volunteerRescue.confirmationDialog("Are you sure you want to delete the kit list ?", function () {
        delete kitLE_lists[g_pageParams.kitUUID];
        vr_device.localStorage.setItem("kitLists", JSON.stringify(kitLE_lists));
        window.history.back()
    }, function () {});
    return false
};
$("#kitLE_page").on("pageshow", function () {
    var c = {
        description: {
            value: "",
            required: true
        },
        location: {
            value: ""
        },
        notes: {
            value: ""
        }
    };
    var a;
    var b;
    vr_device.googleAnalytics();
    g_pageParams = JSON.parse(window.sessionStorage.getItem("kitL_pageParams"));
    kitLE_lists = vr_device.localStorage.getItem("kitLists");
    if (kitLE_lists) {
        kitLE_lists = JSON.parse(kitLE_lists)
    }
    if (!kitLE_lists || (g_pageParams.adding == false && !kitLE_lists[g_pageParams.kitUUID])) {
        window.history.back()
    }
    $("img#kitLE_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    if (g_pageParams.adding == false) {
        c.description.value = kitLE_lists[g_pageParams.kitUUID].description;
        c.location.value = kitLE_lists[g_pageParams.kitUUID].location;
        c.notes.value = kitLE_lists[g_pageParams.kitUUID].notes;
        $("#kitLE_deleteForm").css("display", "inline-block")
    } else {
        $("#kitLE_deleteForm").css("display", "none")
    }
    volunteerRescue.populateFields(c, "kitLE_");
    a = [];
    for (b in kitLE_lists) {
        if (kitLE_lists[b].location != "" && $.inArray(kitLE_lists[b].location, a) == -1) {
            a.push(kitLE_lists[b].location)
        }
    }
    if (a.length > 0) {
        $("#kitLE_location").autocomplete({
            target: $("#kitLE_locations"),
            source: a,
            callback: function (f) {
                var d = $(f.currentTarget);
                $("#kitLE_location").val(d.text());
                $("#kitLE_location").autocomplete("clear")
            }
        });
        $("#kitLE_location").autocomplete("clear")
    }
    $("#kitLE_deleteForm").off("click", kitLE_deleteClickHandler).on("click", kitLE_deleteClickHandler);
    $("#kitLE_submitForm").off("click", kitLE_saveClickHandler).on("click", {
        apiResponse: c
    }, kitLE_saveClickHandler);
    $("#kitLE_form").submit({
        apiResponse: c
    }, kitLE_saveClickHandler)
});