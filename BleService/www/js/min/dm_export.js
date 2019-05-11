/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var dmEX_accounts;
var dmEX_items = {};
var dmEX_saveClickHandler = function () {
    var data = {
        stAMDRs: {},
        kitLists: {},
        manPacings: {},
        stSearches: {},
        manWayPoints: {},
        manGPSTracks: {},
        webLinks: {},
        others: {}
    };
    $.mobile.loading("show", {
        text: "Saving..."
    });
    $("#dmEX_divAMDRs input:checked").each(function () {
        data.stAMDRs[$(this).attr("id")] = dmEX_items.stAMDRs[$(this).attr("id")]
    });
    $("#dmEX_divKitLists input:checked").each(function () {
        data.kitLists[$(this).attr("id")] = dmEX_items.kitLists[$(this).attr("id")]
    });
    $("#dmEX_divPacings input:checked").each(function () {
        data.manPacings[$(this).attr("id")] = dmEX_items.manPacings[$(this).attr("id")]
    });
    $("#dmEX_divSearches input:checked").each(function () {
        data.stSearches[$(this).attr("id")] = dmEX_items.stSearches[$(this).attr("id")]
    });
    $("#dmEX_divWayPoints input:checked").each(function () {
        data.manWayPoints[$(this).attr("id")] = dmEX_items.manWayPoints[$(this).attr("id")]
    });
    $("#dmEX_divGPSTracks input:checked").each(function () {
        data.manGPSTracks[$(this).attr("id")] = dmEX_items.manGPSTracks[$(this).attr("id")]
    });
    $("#dmEX_divWebLinks input:checked").each(function () {
        data.webLinks[$(this).attr("id")] = dmEX_items.webLinks[$(this).attr("id")]
    });
    if ($("#dmEX_chkSettings").prop("checked") == true) {
        data.others.settings = g_settings
    }
    $.ajax({
        url: "https://volunteerrescue.org/api/app/export",
        type: "POST",
        data: {
            action: g_pageParams.id == -1 ? "create" : "update",
            id: g_pageParams.id,
            emailAddress: g_pageParams.accountEmail,
            uuid: dmEX_accounts[g_pageParams.accountEmail].uuid,
            description: $("#dmEX_txtDescription").val(),
            password: $("#dmEX_txtPassword").val(),
            publicExport: $("#dmEX_rdoTypePublic").prop("checked"),
            data: JSON.stringify(data)
        },
        async: true,
        cache: false,
        success: function (json) {
            var apiResponse = eval(json);
            var errors = "";
            var i;
            $.mobile.loading("hide");
            if (apiResponse.result == true) {
                window.history.back()
            } else {
                for (i in apiResponse.errors) {
                    errors += "<li>" + apiResponse.errors[i] + "</li>"
                }
                volunteerRescue.messageDialog("Error", "<p>The following error(s) occurred</p><ul>" + errors + "</ul>", null)
            }
        },
        error: function () {
            $.mobile.loading("hide");
            volunteerRescue.messageDialog("Error", "Unable to save the export.", null)
        }
    })
};
var dmEX_deleteClickHandler = function () {
    volunteerRescue.confirmationDialog("Are you sure you want to delete the export ?", function () {
        $.mobile.loading("show", {
            text: "Deleting..."
        });
        $.ajax({
            url: "https://volunteerrescue.org/api/app/export",
            type: "POST",
            data: {
                action: "delete",
                id: g_pageParams.id,
                emailAddress: g_pageParams.accountEmail,
                uuid: dmEX_accounts[g_pageParams.accountEmail].uuid
            },
            async: true,
            cache: false,
            success: function (json) {
                var apiResponse = eval(json);
                var errors = "";
                var i;
                $.mobile.loading("hide");
                if (apiResponse.result == true) {
                    window.history.back()
                } else {
                    for (i in apiResponse.errors) {
                        errors += "<li>" + apiResponse.errors[i] + "</li>"
                    }
                    volunteerRescue.messageDialog("Error", "<p>The following error(s) occurred</p><ul>" + errors + "</ul>", null)
                }
            },
            error: function () {
                $.mobile.loading("hide");
                volunteerRescue.messageDialog("Error", "Unable to save the export.", null)
            }
        })
    }, function () {});
    return false
};
var dmEX_BuildList = function (b, e, c) {
    var d;
    dmEX_items[b] = vr_device.localStorage.getItem(b);
    if (dmEX_items[b] && dmEX_items[b] != "{}") {
        $("#dmEX_div" + e).css("display", "block");
        d = $("<fieldset>", {
            "data-role": "controlgroup"
        }).append($("<legend>", {
            text: c
        }));
        dmEX_items[b] = JSON.parse(dmEX_items[b]);
        for (var a in dmEX_items[b]) {
            $(d).append($("<input>", {
                type: "checkbox",
                name: a,
                id: a
            })).append($("<label>", {
                "for": a
            }).text(dmEX_items[b][a].description))
        }
        $("#dmEX_div" + e).empty().append(d).enhanceWithin()
    } else {
        $("#dmEX_div" + e).css("display", "none")
    }
};
$("#dmEX_page").on("pageshow", function () {
    vr_device.googleAnalytics();
    g_pageParams = JSON.parse(window.sessionStorage.getItem("dM_pageParams"));
    dmEX_accounts = vr_device.localStorage.getItem("vrAccounts");
    if (dmEX_accounts) {
        dmEX_accounts = JSON.parse(dmEX_accounts)
    }
    if (!dmEX_accounts || !dmEX_accounts[g_pageParams.accountEmail]) {
        window.history.back()
    }
    $("img#dmEX_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    dmEX_BuildList("stAMDRs", "AMDRs", "AMDRs:");
    dmEX_BuildList("kitLists", "LotLists", "Lot Lists:");
    dmEX_BuildList("manPacings", "Pacings", "Pacings:");
    dmEX_BuildList("stSearches", "Searches", "Searches:");
    dmEX_BuildList("manWayPoints", "WayPoints", "Way points:");
    dmEX_BuildList("manGPSTracks", "GPSTracks", "GPS Tracks:");
    dmEX_BuildList("webLinks", "WebLinks", "Web links:");
    if (g_pageParams.id != -1) {
        $.mobile.loading("show", {
            text: "Retrieving data set..."
        });
        $.ajax({
            url: "https://volunteerrescue.org/api/app/export",
            type: "POST",
            data: {
                action: "read",
                id: g_pageParams.id,
                emailAddress: g_pageParams.accountEmail,
                uuid: dmEX_accounts[g_pageParams.accountEmail].uuid
            },
            async: true,
            cache: false,
            success: function (json) {
                var apiResponse = eval(json);
                var errors = "";
                $.mobile.loading("hide");
                if (apiResponse.result == true && apiResponse.data) {
                    var i;
                    var data;
                    data = JSON.parse(apiResponse.data);
                    $("#dmEX_txtDescription").val(apiResponse.description);
                    $("#dmEX_txtPassword").val(apiResponse.password);
                    if (apiResponse.publicExport == true) {
                        $("#dmEX_rdoTypePublic").prop("checked", true);
                        $("#dmEX_rdoTypePrivate").prop("checked", false).checkboxradio("refresh");
                        $("#dmEX_divPassword").css("display", "block")
                    } else {
                        $("#dmEX_rdoTypePublic").prop("checked", false).checkboxradio("refresh");
                        $("#dmEX_rdoTypePrivate").prop("checked", true);
                        $("#dmEX_divPassword").css("display", "none")
                    }
                    for (i in data.stAMDRs) {
                        $('#dmEX_divAMDRs input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.kitLists) {
                        $('#dmEX_divKitLists input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.manPacings) {
                        $('#dmEX_divPacings input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.stSearches) {
                        $('#dmEX_divSearches input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.manWayPoints) {
                        $('#dmEX_divWayPoints input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.manGPSTracks) {
                        $('#dmEX_divGPSTracks input[id="' + i + '"]').prop("checked", true)
                    }
                    for (i in data.webLinks) {
                        $('#dmEX_divWebLinks input[id="' + i + '"]').prop("checked", true)
                    }
                    if (data.others.settings) {
                        $("#dmEX_chkSettings").prop("checked", true)
                    }
                    $("input:checked").checkboxradio("refresh")
                } else {
                    for (i in apiResponse.errors) {
                        errors += "<li>" + apiResponse.errors[i] + "</li>"
                    }
                    volunteerRescue.messageDialog("Error", "<p>The following error(s) occurred</p><ul>" + errors + "</ul>", function () {
                        window.history.back()
                    })
                }
            },
            error: function () {
                $.mobile.loading("hide");
                volunteerRescue.messageDialog("Error", "Failed to retrieve data set.", function () {
                    window.history.back()
                })
            }
        });
        $("#dmEX_deleteForm").css("display", "inline-block")
    } else {
        $("#dmEX_txtDescription").val(null);
        $("#dmEX_rdoTypePrivate").prop("checked", true).checkboxradio("refresh");
        $("#dmEX_rdoTypePublic").prop("checked", false).checkboxradio("refresh");
        $("#dmEX_divPassword").css("display", "none");
        $("#dmEX_deleteForm").css("display", "none")
    }
    $("#dmEX_deleteForm").off("click", dmEX_deleteClickHandler).on("click", dmEX_deleteClickHandler);
    $("#dmEX_submitForm").off("click", dmEX_saveClickHandler).on("click", dmEX_saveClickHandler);
    $("#dmEX_pageTitle").text(g_pageParams.accountDescription + " - Save to the cloud");
    $("#dmEX_form").submit(dmEX_saveClickHandler);
    $('[name="dmEX_rdoType"]').change(function () {
        $("#dmEX_divPassword").css("display", $("#dmEX_rdoTypePublic").prop("checked") == true ? "block" : "none")
    })
});