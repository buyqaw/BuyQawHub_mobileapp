/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var dmIM_accounts;
var dmIM_items = {};
var dmIM_currentItems = {};
var dmIM_saveClickHandler = function () {
    var b, a = false;
    for (b in dmIM_items) {
        if (b != "others") {
            $('[id^="dmIM_div"][data-vr-key="' + b + '"] input:checked').each(function () {
                dmIM_currentItems[b][$(this).attr("id")] = dmIM_items[b][$(this).attr("id")]
            });
            dmIM_currentItems[b] = volunteerRescue.sortAssociative(dmIM_currentItems[b]);
            vr_device.localStorage.setItem(b, JSON.stringify(dmIM_currentItems[b]))
        } else {
            if ($("#dmIM_chkSettings").prop("checked") == true) {
                if (typeof dmIM_items[b].settings.websiteURL == "string") {
                    g_settings.websiteURL = dmIM_items[b].settings.websiteURL && dmIM_items[b].settings.websiteURL != "" && dmIM_items[b].settings.websiteURL[0] != "https://" ? [dmIM_items[b].settings.websiteURL] : [];
                    vr_device.localStorage.setItem("vrSettings", JSON.stringify(g_settings))
                } else {
                    g_settings.websiteURL = dmIM_items[b].settings.websiteURL
                }
                g_settings.wifiOnly = dmIM_items[b].settings.wifiOnly;
                vr_device.localStorage.setItem("vrSettings", JSON.stringify(g_settings));
                vr_device.onOnLine();
                a = true
            }
        }
    }
    if (a == true) {
        volunteerRescue.updateSites()
    } else {
        window.history.back()
    }
};
var dmIM_BuildList = function (b, f, d) {
    var e;
    var c;
    if (dmIM_items[b]) {
        dmIM_currentItems[b] = vr_device.localStorage.getItem(b);
        dmIM_currentItems[b] = dmIM_currentItems[b] && dmIM_currentItems[b] != "{}" ? JSON.parse(dmIM_currentItems[b]) : {};
        e = $("<fieldset>", {
            "data-role": "controlgroup"
        }).append($("<legend>", {
            text: d
        }));
        c = 0;
        for (var a in dmIM_items[b]) {
            $(e).append($("<input>", {
                type: "checkbox",
                name: a,
                id: a
            })).append($("<label>", {
                "for": a
            }).text((dmIM_currentItems[b][a] ? "Update: " : "Add: ") + dmIM_items[b][a].description));
            c++
        }
        $("#dmIM_div" + f).empty().append(e).enhanceWithin().css("display", c > 0 ? "block" : "none")
    }
};
$("#dmIM_page").on("pageshow", function () {
    vr_device.googleAnalytics();
    $("#dmIM_divAMDRs, #dmIM_divKitLists, #dmIM_divPacings, #dmIM_divSearches, #dmIM_divWayPoints, #dmIM_divGPSTracks, #dmIM_divWebLinks, #dmIM_divOthers").css("display", "none");
    g_pageParams = JSON.parse(window.sessionStorage.getItem("dM_pageParams"));
    dmIM_accounts = vr_device.localStorage.getItem("vrAccounts");
    if (dmIM_accounts) {
        dmIM_accounts = JSON.parse(dmIM_accounts)
    }
    if (!dmIM_accounts || !dmIM_accounts[g_pageParams.accountEmail]) {
        window.history.back()
    }
    $("img#dmIM_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    $.mobile.loading("show", {
        text: "Retrieving import information..."
    });
    $.ajax({
        url: "https://volunteerrescue.org/api/app/export",
        type: "POST",
        data: {
            action: "read",
            id: g_pageParams.id,
            password: g_pageParams.password,
            emailAddress: g_pageParams.accountEmail,
            uuid: dmIM_accounts[g_pageParams.accountEmail].uuid
        },
        async: true,
        cache: false,
        success: function (json) {
            var apiResponse = eval(json);
            var errors = "";
            var i;
            $.mobile.loading("hide");
            if (apiResponse.result == true && apiResponse.data) {
                dmIM_items = JSON.parse(apiResponse.data);
                dmIM_BuildList("stAMDRs", "AMDRs", "AMDRs:");
                dmIM_BuildList("kitLists", "KitLists", "Kit Lists:");
                dmIM_BuildList("manPacings", "Pacings", "Pacings:");
                dmIM_BuildList("stSearches", "Searches", "Searches:");
                dmIM_BuildList("manWayPoints", "WayPoints", "Way points:");
                dmIM_BuildList("manGPSTracks", "GPSTracks", "GPS Tracks:");
                dmIM_BuildList("webLinks", "WebLinks", "Web links:");
                if (dmIM_items.others.settings) {
                    list = $("<fieldset>", {
                        "data-role": "controlgroup"
                    }).append($("<legend>", {
                        text: "Others"
                    })).append($("<input>", {
                        type: "checkbox",
                        name: "dmIM_chkSettings",
                        id: "dmIM_chkSettings"
                    })).append($("<label>", {
                        "for": "dmIM_chkSettings"
                    }).text("Settings"));
                    $("#dmIM_divOthers").empty().append(list).enhanceWithin().css("display", "block")
                } else {
                    $("#dmIM_divOthers").css("display", "none")
                }
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
            volunteerRescue.messageDialog("Error", "Failed to retrieve import information.", function () {
                window.history.back()
            })
        }
    });
    $("#dmIM_submitForm").off("click", dmIM_saveClickHandler).on("click", dmIM_saveClickHandler);
    $("#dmIM_pageTitle").text(g_pageParams.accountDescription + " - Load from the cloud");
    $("#dmIM_form").submit(dmIM_saveClickHandler)
});