/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var volunteerRescue = {
    apiCommand: null,
    apiURL: null,
    sites: null,
    currentSite: null,
    inAppBrowser: null,
    initialise: function () {
        var b, a, c, d = $.Deferred();
        $.when(vr_device.localStorage.initialise()).always(function () {
            g_settings = vr_device.localStorage.getItem("vrSettings");
            if (g_settings && g_settings != "{}" && g_settings != "null") {
                g_settings = JSON.parse(g_settings)
            } else {
                g_settings = {
                    websiteURL: [],
                    wifiOnly: false
                }
            }
            a = vr_device.localStorage.getItem("vrVersion");
            if (a && JSON.parse(a) == "2.6.0") {
                vr_device.localStorage.setItem("vrVersion", JSON.stringify("2.7.0"))
            } else {
                if (!a || (a != "2.6.0" && a != "2.7.0")) {
                    c = vr_device.localStorage.getItem("vrSites");
                    if (typeof c == "undefined" || c == null || c == "" || c == "{}") {
                        c = {};
                        if ($.isArray(g_settings.websiteURL) && g_settings.websiteURL.length > 0 && g_settings.websiteURL[0] != "https://") {
                            c[g_settings.websiteURL[0]] = {
                                description: null,
                                image: null,
                                accessToken: vr_device.localStorage.getItem("accessToken"),
                                refreshToken: vr_device.localStorage.getItem("refreshToken"),
                                accessTokenExpires: vr_device.localStorage.getItem("accessTokenExpires"),
                                member: null
                            }
                        }
                        vr_device.localStorage.removeItem("accessToken");
                        vr_device.localStorage.removeItem("refreshToken");
                        vr_device.localStorage.removeItem("accessTokenExpires");
                        vr_device.localStorage.removeItem("meName");
                        vr_device.localStorage.removeItem("meStartCallOut");
                        vr_device.localStorage.removeItem("meStartConferenceCall");
                        vr_device.localStorage.removeItem("meViewCallOut");
                        vr_device.localStorage.removeItem("meViewMemberList");
                        vr_device.localStorage.removeItem("meViewContactList");
                        vr_device.localStorage.removeItem("meCustomBookCount");
                        vr_device.localStorage.removeItem("meOnCallICSRoleCount");
                        volunteerRescue.sites = volunteerRescue.sortAssociative(c);
                        vr_device.localStorage.setItem("vrSites", JSON.stringify(c))
                    }
                    vr_device.localStorage.setItem("vrSettings", JSON.stringify(g_settings));
                    vr_device.localStorage.setItem("vrVersion", JSON.stringify("2.7.0"))
                }
            }
            volunteerRescue.sites = vr_device.localStorage.getItem("vrSites");
            volunteerRescue.sites = volunteerRescue.sites && volunteerRescue.sites != "{}" ? JSON.parse(volunteerRescue.sites) : {};
            volunteerRescue.currentSite = vr_device.localStorage.getItem("vrCurrentSite");
            volunteerRescue.currentSite = volunteerRescue.currentSite ? JSON.parse(volunteerRescue.currentSite) : null;
            if (typeof g_settings.websiteURL == "string") {
                g_settings.websiteURL = g_settings.websiteURL && g_settings.websiteURL != "" && g_settings.websiteURL[0] != "https://" ? [g_settings.websiteURL] : [];
                vr_device.localStorage.setItem("vrSettings", JSON.stringify(g_settings))
            }
            for (b in g_settings.websiteURL) {
                if (!volunteerRescue.sites[g_settings.websiteURL[b]]) {
                    volunteerRescue.sites[g_settings.websiteURL[b]] = {
                        description: null,
                        image: null,
                        accessToken: null,
                        refreshToken: null,
                        accessTokenExpires: null
                    }
                }
            }
            volunteerRescue.sites = volunteerRescue.sortAssociative(volunteerRescue.sites);
            vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites));
            d.resolve()
        });
        return d
    },
    initialiseDashboard: function () {
        window.sessionStorage.setItem("dBD_selectSite", true)
    },
    setCurrentSite: function (a) {
        volunteerRescue.currentSite = a.toLowerCase();
        vr_device.localStorage.setItem("vrCurrentSite", JSON.stringify(volunteerRescue.currentSite));
        if (!volunteerRescue.sites[volunteerRescue.currentSite]) {
            volunteerRescue.sites[volunteerRescue.currentSite] = {
                description: null,
                image: null,
                accessToken: null,
                refreshToken: null,
                accessTokenExpires: null,
                member: null
            };
            vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites))
        }
    },
    callAPI: function (url, command, loadingMessage, fnSuccess, fnSuccessError, fnError, params) {
        var doAjax = function (validToken) {
            if (validToken == false || volunteerRescue.sites[volunteerRescue.apiURL].accessToken == null) {
                $.mobile.loading("hide");
                return
            }
            $.ajax($.extend({
                url: volunteerRescue.apiURL + "/api/1_1/" + volunteerRescue.apiCommand,
                async: true,
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                success: function (json) {
                    var apiResponse = eval(json);
                    var errors = "";
                    var i;
                    $.mobile.loading("hide");
                    if (apiResponse.result == true) {
                        fnSuccess(apiResponse)
                    } else {
                        if (fnSuccessError == null || fnSuccessError == undefined) {
                            for (i in apiResponse.errors) {
                                errors += "<li>" + apiResponse.errors[i] + "</li>"
                            }
                            volunteerRescue.messageDialog("Error", "<p>The following errors occured</p><ul>" + errors + "</ul>", null)
                        } else {
                            fnSuccessError(apiResponse)
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 401 && volunteerRescue.sites[volunteerRescue.apiURL].accessToken != null) {
                        volunteerRescue.clearAccessToken();
                        volunteerRescue.getAccessToken(doAjax)
                    } else {
                        if (fnError == null || fnError == undefined) {
                            $.mobile.loading("hide");
                            if (g_onLine == false) {
                                volunteerRescue.messageDialog("Offline", "This option requires an online connection to the organization's VolunteerRescue service.", null)
                            } else {
                                volunteerRescue.messageDialog("Error", "<p>Error connecting with the organization's VolunteerRescue service</p><ul><li>" + volunteerRescue.apiURL + "</li><li>" + jqXHR.status + "</li><li>" + textStatus + "</li><li>" + errorThrown + "</li></ul>", null)
                            }
                        } else {
                            fnError(jqXHR, textStatus, errorThrown)
                        }
                    }
                },
                beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("Authorization", "Bearer " + volunteerRescue.sites[volunteerRescue.apiURL].accessToken)
                }
            }, params))
        };
        if (loadingMessage) {
            $.mobile.loading("show", {
                text: loadingMessage
            })
        }
        volunteerRescue.apiCommand = command;
        volunteerRescue.apiURL = url;
        volunteerRescue.getAccessToken(doAjax)
    },
    populateFields: function (b, d) {
        var c;
        for (var a in b) {
            c = $("#" + d + a);
            if (c.length) {
                if (b[a]["options"]) {
                    c.empty();
                    $.each(b[a]["options"], function (e, f) {
                        c.append($("<option/>", {
                            value: e,
                            text: f
                        }))
                    })
                }
                if (b[a]["value"] !== undefined) {
                    c.val(b[a]["value"])
                }
                if ("checked" in b[a]) {
                    c.prop("checked", b[a]["checked"])
                }
                if (b[a]["placeholder"]) {
                    c.prop("placeholder", b[a]["placeholder"])
                }
                if (b[a]["pattern"] && Modernizr.input.pattern == true) {
                    c.prop("pattern", b[a]["pattern"])
                }
                if (b[a]["required"] && Modernizr.input.required == true) {
                    c.prop("required", b[a]["required"])
                }
            }
        }
    },
    checkFields: function (e, f) {
        var a;
        var c;
        var h = "";
        var g = true;
        var d = e.data.apiResponse;
        for (a in d) {
            c = $("#" + f + a);
            if (c.length > 0 && d[a]["required"]) {
                if (!c.val()) {
                    h += "<li>" + $('label[for="' + f + a + '"]').text() + " Is required</li>";
                    if (Modernizr.formvalidation == false) {
                        c.addClass("vr-field-required")
                    }
                    g = false;
                    continue
                } else {
                    if (Modernizr.formvalidation == false) {
                        c.removeClass("vr-field-required")
                    }
                }
            }
            if (d[a]["pattern"] && Modernizr.formvalidation == false) {
                var b = new RegExp(d[a]["pattern"], "g");
                if ($(c).val() && $(c).val().match(b) == null) {
                    h += "<li>" + $('label[for="' + f + a + '"]').text() + " Invalid format</li>";
                    if (Modernizr.formvalidation == false) {
                        c.css("border-color", "red")
                    }
                    g = false;
                    continue
                } else {
                    if (Modernizr.formvalidation == false) {
                        c.css("border-color", "")
                    }
                }
            }
        }
        if (g == false) {
            volunteerRescue.messageDialog("Error", "<p>The following field(s) have errors</p><ul>" + h + "</ul>", null)
        }
        return g
    },
    isAccessTokenCurrent: function (b) {
        var a = (volunteerRescue.sites[b].accessToken == null || volunteerRescue.sites[b].accessTokenExpires < (new Date()).getTime()) ? false : true;
        return a
    },
    clearAccessToken: function () {
        volunteerRescue.sites[volunteerRescue.apiURL].member = null;
        volunteerRescue.sites[volunteerRescue.apiURL].accessToken = null;
        volunteerRescue.sites[volunteerRescue.apiURL].accessTokenExpires = null;
        vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites))
    },
    getAccessToken: function (a) {
        if (!$.isArray(g_settings.websiteURL) || g_settings.websiteURL.length == 0) {
            volunteerRescue.messageDialog("Settings", "Please enter a web site address for the organization's VolunteerRescue service in the settings.", null);
            a(false);
            return
        }
        $("body").on("vr_getAccessToken", function (b, c) {
            if (volunteerRescue.inAppBrowser != null) {
                volunteerRescue.inAppBrowser.removeEventListener("loadstop", volunteerRescue.onInAppLocationChange);
                volunteerRescue.inAppBrowser.removeEventListener("exit", volunteerRescue.onInAppClose);
                volunteerRescue.inAppBrowser = null
            }
            $(this).off(b);
            a(c)
        });
        if (volunteerRescue.sites[volunteerRescue.apiURL].accessToken == null || volunteerRescue.sites[volunteerRescue.apiURL].accessTokenExpires < (new Date()).getTime()) {
            if (volunteerRescue.sites[volunteerRescue.apiURL].refreshToken != null) {
                $.ajax({
                    type: "POST",
                    async: true,
                    cache: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    url: volunteerRescue.apiURL + "/api/refresh_token",
                    data: {
                        refresh_token: volunteerRescue.sites[volunteerRescue.apiURL].refreshToken
                    },
                    success: function (b) {
                        if (b.result == true) {
                            $.ajax({
                                type: "POST",
                                async: true,
                                cache: false,
                                xhrFields: {
                                    withCredentials: true
                                },
                                url: volunteerRescue.apiURL + "/api/oauth2/token",
                                data: {
                                    client_id: b.client_id,
                                    client_secret: b.client_secret,
                                    grant_type: "refresh_token",
                                    scope: "me_personal me_emergency me_certifications",
                                    refresh_token: volunteerRescue.sites[volunteerRescue.apiURL].refreshToken
                                },
                                success: function (c) {
                                    if (c.access_token) {
                                        volunteerRescue.sites[volunteerRescue.apiURL].accessToken = c.access_token;
                                        volunteerRescue.sites[volunteerRescue.apiURL].refreshToken = c.refresh_token;
                                        volunteerRescue.sites[volunteerRescue.apiURL].accessTokenExpires = ((new Date()).getTime()) + ((new Number(c.expires_in)) * 1000);
                                        vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites));
                                        $("body").off("vr_getAccessToken");
                                        a(true)
                                    } else {
                                        volunteerRescue.doShowInAppBrowser()
                                    }
                                },
                                error: function () {
                                    volunteerRescue.doShowInAppBrowser()
                                }
                            })
                        } else {
                            volunteerRescue.doShowInAppBrowser()
                        }
                    },
                    error: function () {
                        volunteerRescue.doShowInAppBrowser()
                    }
                })
            } else {
                volunteerRescue.doShowInAppBrowser()
            }
        } else {
            $("body").trigger("vr_getAccessToken", true)
        }
    },
    doShowInAppBrowser: function () {
        volunteerRescue.inAppBrowser = vr_device.showInAppBrowser(volunteerRescue.apiURL + "/api/access_token", "_blank", "location=no,hidden=yes");
        if (volunteerRescue.inAppBrowser != null) {
            volunteerRescue.inAppBrowser.addEventListener("loadstop", volunteerRescue.onInAppLocationChange);
            volunteerRescue.inAppBrowser.addEventListener("exit", volunteerRescue.onInAppClose)
        }
    },
    onInAppClose: function (a) {
        $("body").trigger("vr_getAccessToken", false)
    },
    onInAppLocationChange: function (a) {
        var b = decodeURIComponent(a.url);
        volunteerRescue.inAppBrowser.show();
        if (b.indexOf(volunteerRescue.apiURL) == 0 && b.indexOf("api/fb_") == -1) {
            if (b.indexOf("access_token=") > -1) {
                var e = {};
                var f = b.substr(b.indexOf("#") + 1).replace(/&amp;/g, "&");
                var c = /([^&=]+)=([^&]*)/g;
                var d;
                while (d = c.exec(f)) {
                    e[decodeURIComponent(d[1])] = decodeURIComponent(d[2])
                }
                if (e.access_token != undefined) {
                    volunteerRescue.sites[volunteerRescue.apiURL].accessToken = e.access_token;
                    volunteerRescue.sites[volunteerRescue.apiURL].refreshToken = e.refresh_token;
                    volunteerRescue.sites[volunteerRescue.apiURL].accessTokenExpires = ((new Date()).getTime()) + ((new Number(e.expires_in)) * 1000);
                    vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites))
                }
                if (volunteerRescue.inAppBrowser != null) {
                    volunteerRescue.inAppBrowser.close()
                }
                $("body").trigger("vr_getAccessToken", true)
            } else {
                if (b.indexOf("error=") > -1) {
                    if (volunteerRescue.inAppBrowser != null) {
                        volunteerRescue.inAppBrowser.close()
                    }
                    volunteerRescue.clearAccessToken();
                    $("body").trigger("vr_getAccessToken", false)
                }
            }
        }
    },
    changePage: function (a) {

        if (g_onLine == true) {
            volunteerRescue.apiURL = volunteerRescue.currentSite;
            console.log(volunteerRescue.apiURL);
            volunteerRescue.getAccessToken(function (b) {
                if (b == true) {
                    $.mobile.changePage(a.attr("href"));
                } else {
                    $.mobile.loading("hide");
                    a.closest('[class~="ui-btn-active"]').removeClass("ui-btn-active");
                }
            })

        } else {
            volunteerRescue.messageDialog("Offline", "This option requires an online connection to the organization's VolunteerRescue service.", null);
            a.closest('[class~="ui-btn-active"]').removeClass("ui-btn-active")
        }
    },
    writeLog: function (a) {
        console.log("!VR!: " + a)
    },
    getSiteDescription: function (a) {
        return (!volunteerRescue.sites[a] || !volunteerRescue.sites[a].description ? a : volunteerRescue.sites[a].description)
    },
    getMeName: function (a) {
        if (g_onLine == true) {
            if (!volunteerRescue.sites[volunteerRescue.currentSite].member || volunteerRescue.isAccessTokenCurrent(volunteerRescue.currentSite) == false) {
                volunteerRescue.callAPI(volunteerRescue.currentSite, "me", "Retrieving member name...", function (b) {
                    if (b.siteDescription) {
                        volunteerRescue.sites[volunteerRescue.currentSite].description = b.siteDescription
                    }
                    if (b.siteImage) {
                        volunteerRescue.sites[volunteerRescue.currentSite].image = b.siteImage
                    }
                    volunteerRescue.sites[volunteerRescue.currentSite].member = {
                        name: b.name,
                        startCallOut: b.startCallOut,
                        startConferenceCall: b.startConferenceCall,
                        viewCallOut: b.viewCallOut,
                        viewMemberList: b.viewMemberList,
                        viewContactList: b.viewContactList,
                        customBookCount: b.customBookCount,
                        onCallICSRoleCount: b.onCallICSRoleCount
                    };
                    vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites));
                    if (a != null && a != undefined) {
                        a(b)
                    }
                })
            } else {
                if (a != null && a != undefined) {
                    a(null)
                }
            }
        }
    },
    getUrlVars: function () {
        var d = [],
            c;
        var a = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
        for (var b = 0; b < a.length; b++) {
            c = a[b].split("=");
            d.push(c[0]);
            d[c[0]] = c[1]
        }
        return d
    },
    setDateFields: function () {
        if (!Modernizr.inputtypes.date) {
            var b = (new Date()).getFullYear() + 5;
            try {
                $("input[type='date']").each(function () {
                    $(this).mobiscroll({
                        preset: "date",
                        headerText: false,
                        dateFormat: "yy-mm-dd",
                        dateOrder: "D ddMyy",
                        endYear: b
                    })
                })
            } catch (a) {}
        }
        if (!Modernizr.inputtypes.time) {
            try {
                $("input[type='time']").each(function () {
                    $(this).mobiscroll({
                        preset: "time",
                        headerText: false,
                        timeFormat: "h:ii A",
                        stepMinute: 15
                    })
                })
            } catch (a) {}
        }
    },
    confirmationDialog: function (b, c, a) {
        volunteerRescue.dynamicPopup("Confirm", $("<div>").append($("<p>").append(b)).append($("<a>", {
            text: "Ok",
            "class": "ui-btn ui-btn-g ui-btn-inline ui-corner-all"
        }).on("click", function () {
            $("#vr_dynamicPopup").popup("close");
            if (c != null) {
                c()
            }
        })).append($("<a>", {
            text: "Cancel",
            "class": "ui-btn ui-btn-r ui-btn-inline ui-corner-all"
        }).on("click", function () {
            $("#vr_dynamicPopup").popup("close");
            if (a != null) {
                a()
            }
        })), false)
    },
    messageDialog: function (c, a, b) {
        volunteerRescue.dynamicPopup(c, $("<div>").append(a).append($("<a>", {
            text: "Close",
            "class": "ui-btn ui-corner-all"
        }).on("click", function () {
            $("#vr_dynamicPopup").popup("close");
            if (b != null) {
                b()
            }
        })), false)
    },
    dynamicPopup: function (d, a, c) {
        var b = $("<div/>", {
            id: "vr_dynamicPopup"
        }).popup({
            dismissible: false,
            history: false,
            theme: "a",
            overlayTheme: "b",
            transition: "pop"
        }).on("popupafterclose", function () {
            $(this).remove()
        });
        if (c == true) {
            b.append($("<a>", {
                href: "#",
                "data-rel": "back",
                text: "Close",
                "class": "ui-btn ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right"
            }))
        }
        if (d) {
            b.append($("<div>").addClass("ui-header ui-bar-inherit").append($("<h2>").addClass("ui-title").text(d)))
        }
        b.append($("<div>").addClass("ui-content").append($("<p>").html(a))).popup("open").trigger("pagecreate")
    },
    currentDate: function () {
        var a = new Date();
        return a.getFullYear() + "-" + (String("00" + (a.getMonth() + 1)).slice(-2)) + "-" + (String("00" + (a.getDate())).slice(-2))
    },
    currentTime: function () {
        var a = new Date();
        return (String("00" + (a.getHours())).slice(-2)) + ":" + (String("00" + (a.getMinutes())).slice(-2))
    },
    round: function (a) {
        return Math.round(a * 100000) / 100000
    },
    sortAssociative: function (b) {
        var a = [];
        var d = {};
        if ("location" in b) {
            for (var c in b) {
                a.push({
                    uuid: c,
                    location: b[c].location,
                    description: b[c].description
                })
            }
        } else {
            for (var c in b) {
                if ("location" in b[c]) {
                    a.push({
                        uuid: c,
                        location: b[c].location,
                        description: b[c].description
                    })
                } else {
                    a.push({
                        uuid: c,
                        description: b[c].description
                    })
                }
            }
        }
        a.sort(volunteerRescue.sortByObject);
        for (var c in a) {
            d[a[c].uuid] = b[a[c].uuid]
        }
        return d
    },
    sortByObject: function (d, c) {
        var i, g;
        var h, f;
        var e;
        if ("locationStorage" in d && "locationStorage" in c) {
            i = d.locationStorage.toLowerCase();
            g = c.locationStorage.toLowerCase()
        } else {
            if ("location" in d && "location" in c) {
                i = d.location.toLowerCase();
                g = c.location.toLowerCase()
            } else {
                i = g = null
            }
        }
        if (i != g) {
            e = (i < g ? -1 : (i > g ? 1 : 0))
        } else {
            if (typeof d.description == "string" && typeof d.description == "string" && d.description && c.description) {
                h = d.description.toLowerCase();
                f = c.description.toLowerCase()
            } else {
                h = d.description;
                f = c.description
            }
            e = (h < f ? -1 : (h > f ? 1 : 0))
        }
        return e
    },
    generateUUID: function () {
        var b = (new Date()).getTime();
        var a = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var d = (b + Math.random() * 16) % 16 | 0;
            b = Math.floor(b / 16);
            return (e == "x" ? d : (d & 7 | 8)).toString(16)
        });
        return a
    },
    searchProbabilityCalculator: function (h, a) {
        var e, d, b, g, f, k, c;
        if (h) {
            if (!h.results) {
                h.results = {
                    grandTotal: 0,
                    regions: {}
                }
            } else {
                h.results.grandTotal = 0
            }
            for (e in h.regions) {
                h.results.regions[e].subTotal = 0;
                for (d in h.evaluators) {
                    if (h.evaluators[d].regions && h.evaluators[d].regions[e]) {
                        h.results.regions[e].subTotal += h.evaluators[d].regions[e]
                    }
                }
                h.results.grandTotal += h.results.regions[e].subTotal
            }
            g = [];
            for (e in h.regions) {
                f = h.regions[e];
                k = h.results.regions[e];
                if (!a) {
                    b = k.POA = Number(Number(k.subTotal / h.results.grandTotal * 100).toFixed(2))
                } else {
                    b = a[e].POA
                }
                volunteerRescue.regionProbabilityCalculator(f, k, b, null, k.POD);
                g.push({
                    id: e,
                    description: b
                })
            }
            g = g.sort(volunteerRescue.sortByObject);
            h.results.rankingPOA = {};
            c = 0;
            b = 0;
            for (e = g.length - 1; e >= 0; e--) {
                if (g[e].description != b) {
                    c++;
                    b = g[e].description
                }
                h.results.rankingPOA[g[e].id] = c
            }
        }
        return h.results
    },
    regionProbabilityCalculator: function (e, b, c, d, a) {
        if (e && b) {
            b.PDen = Number(Number(c / b.area).toFixed(2));
            b.PSR = Number(Number(b.PDen * b.searcherSpeed * b.ESW / 1000).toFixed(2));
            if (d) {
                b.coverage = Number(Number(d).toFixed(1));
                b.POD = Number(Number(1 - Math.pow(Math.E, b.coverage * -1)).toFixed(2))
            } else {
                if (a) {
                    b.POD = Number(Number(a).toFixed(2));
                    b.coverage = a != 1 ? Number(Number(Math.abs(Math.log(1 - b.POD))).toFixed(1)) : 4.6;
                    if (b.coverage < 0.1) {
                        b.coverage = 0.1
                    }
                }
            }
            b.trackSpacing = Number(Number(b.ESW / b.coverage).toFixed(2));
            b.POS = Number(Number(b.POD * c).toFixed(2));
            b.effort = Number(Number(b.area / (b.trackSpacing / 1000)).toFixed(2));
            b.areaSwept = Number(Number(b.ESW * b.effort / 1000).toFixed(2))
        }
    },
    zeroPad: function (d, c) {
        return (1000000000000000 + d + "").slice(-c)
    },
    touchScroll: function (d) {
        if (navigator.userAgent.match(/android 2/i)) {
            var a = document.getElementById(d);
            var b = 0;
            var c = 0;
            document.getElementById(d).addEventListener("touchstart", function (e) {
                b = this.scrollTop + e.touches[0].pageY;
                c = this.scrollLeft + e.touches[0].pageX
            }, false);
            document.getElementById(d).addEventListener("touchmove", function (e) {
                if ((this.scrollTop < this.scrollHeight - this.offsetHeight && this.scrollTop + e.touches[0].pageY < b - 5) || (this.scrollTop != 0 && this.scrollTop + e.touches[0].pageY > b + 5)) {
                    e.preventDefault()
                }
                if ((this.scrollLeft < this.scrollWidth - this.offsetWidth && this.scrollLeft + e.touches[0].pageX < c - 5) || (this.scrollLeft != 0 && this.scrollLeft + e.touches[0].pageX > c + 5)) {
                    e.preventDefault()
                }
                this.scrollTop = b - e.touches[0].pageY;
                this.scrollLeft = c - e.touches[0].pageX
            }, false)
        }
    },
    updateSites: function () {

        var i, tmp, defs = [];
        tmp = $.extend({}, volunteerRescue.sites);
        volunteerRescue.sites = {};
        $.mobile.loading("show", {
            text: "Retrieving VolunteerRescue site details..."
        });
        for (i in g_settings.websiteURL) {
            defs.push($.Deferred());
            if (tmp[g_settings.websiteURL[i]]) {
                volunteerRescue.sites[g_settings.websiteURL[i]] = $.extend({}, tmp[g_settings.websiteURL[i]])
            } else {
                volunteerRescue.sites[g_settings.websiteURL[i]] = {
                    description: null,
                    image: null,
                    accessToken: null,
                    refreshToken: null,
                    accessTokenExpires: null
                }
            }
            $.ajax({
                url: g_settings.websiteURL[i] + "/api/1_1/gp_details",
                type: "GET",
                async: true,
                cache: false,
                vrOffset: i,
                success: function (json) {
                    var apiResponse = eval(json);
                    volunteerRescue.sites[g_settings.websiteURL[this.vrOffset]].image = apiResponse.image;
                    volunteerRescue.sites[g_settings.websiteURL[this.vrOffset]].description = apiResponse.description;
                    defs[this.vrOffset].resolve()
                },
                error: function () {
                    defs[this.vrOffset].resolve()
                }
            })
        }
        $.when.apply($, defs).done(function () {
            vr_device.onOnLine();
            volunteerRescue.sites = volunteerRescue.sortAssociative(volunteerRescue.sites);
            vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites));
            $.mobile.loading("hide");
            //window.history.back()
        })
    },
    gpsRecordPosition: function (f) {
        var j;
        var g = new Date(f.timestamp).getTime();
        var h = vr_device.localStorage.getItem("manGPSTracks");
        var c = vr_device.localStorage.getItem("manGPSCurrentTrack");
        if (c) {
            c = JSON.parse(c)
        }
        if (h) {
            h = JSON.parse(h)
        }
        if (h && c && h[c.trackUUID] && h[c.trackUUID].startedAt && !h[c.trackUUID].stoppedAt && ((g - h[c.trackUUID].startedAt) / 3600000) < h[c.trackUUID].trackFor) {
            var d = (!f.coords.accuracy ? 0 : Number(f.coords.accuracy.toFixed(4)));
            if (h[c.trackUUID].startedAt <= g && d <= h[c.trackUUID].maximumAccuracy) {
                var b = 0;
                var i = Number(f.coords.latitude.toFixed(8));
                var a = Number(f.coords.longitude.toFixed(8));
                var e = (!f.coords.altitude ? 0 : Number(f.coords.altitude.toFixed(4)));
                if (h[c.trackUUID].points.length > 0) {
                    j = h[c.trackUUID].points[0]
                }
                if (j != null) {
                    b = Number(Number((new LatLon(c.lastLatitude, c.lastLongitude)).distanceTo(new LatLon(i, a)) * 1000).toFixed(4));
                    if (b != 0) {
                        c.lastDistance += b
                    }
                }
                c.lastLatitude = i;
                c.lastLongitude = a;
                c.lastAltitude = e;
                vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(c));
                if (j == null || c.lastDistance >= h[c.trackUUID].distanceFilter) {
                    if (j != null) {
                        h[c.trackUUID].totalDistance = Number(Number(h[c.trackUUID].totalDistance + c.lastDistance).toFixed(4))
                    }
                    h[c.trackUUID].points.unshift([g, i, a, e, d, Number(Number(c.lastDistance).toFixed(4))]);
                    c.lastDistance = 0;
                    vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(c));
                    vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(h));
                    if ($.mobile.activePage.attr("id") == "manTLV_page" && g_pageParams.trackUUID == c.trackUUID) {
                        manTLV_showPoint($("#manTLV_lstPoints"), h[c.trackUUID].points[0], true);
                        $("#manTLV_lstPoints").listview("refresh")
                    } else {
                        if ($.mobile.activePage.attr("id") == "manTL_page") {
                            $("#manTL_item_" + c.trackUUID).html(manTL_buildItem(h[c.trackUUID], c.trackUUID));
                            $("#manTLV_lstTracks").listview("refresh")
                        }
                    }
                    if (h[c.trackUUID].serverURL != "-1" && h[c.trackUUID].serverToken && h[c.trackUUID].serverPointsSent < h[c.trackUUID].points.length && (h[c.trackUUID].serverLastSentAt == null || ((new Date()).getTime() - h[c.trackUUID].serverLastSentAt) >= (h[c.trackUUID].serverInterval * 60000))) {
                        volunteerRescue.gpsSendToServer(h[c.trackUUID], c.trackUUID, false, false)
                    }
                }
            }
        } else {
            if (c) {
                if ($.mobile.activePage.attr("id") == "manTLV_page" && g_pageParams.trackUUID == c.trackUUID) {
                    $("#manTLV_btnStart").css("display", "none");
                    $("#manTLV_btnStop").css("display", "none");
                    $("#manTLV_clearTrack").css("display", "block")
                }
                vr_device.stopTracking(c);
                vr_device.localStorage.removeItem("manGPSCurrentTrack");
                if (h && !h[c.trackUUID].stoppedAt) {
                    h[c.trackUUID].stoppedAt = (new Date()).getTime();
                    vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(h));
                    if ($.mobile.activePage.attr("id") == "manTL_page") {
                        $("#manTL_track_img" + c.trackUUID).attr("src", g_basePath + "images/incorrect-16.png");
                        $("#manTL_item_" + c.trackUUID).html(manTL_buildItem(h[c.trackUUID], c.trackUUID));
                        $("#manTLV_lstTracks").listview("refresh")
                    }
                }
                if (h[c.trackUUID].serverURL != "-1" && h[c.trackUUID].serverToken) {
                    volunteerRescue.gpsSendToServer(h[c.trackUUID], c.trackUUID, false, false)
                }
            }
        }
    },
    gpsBuildData: function (a) {
        var c, b;
        var d = a.points.length - a.serverPointsSent;
        var e = {
            stoppedAt: (a.stoppedAt ? moment(a.stoppedAt).format("YYYY-MM-DD HH:mm:ss") : null),
            totalDistance: a.totalDistance,
            points: []
        };
        if (d > 0) {
            for (c = d - 1, b = 0; c >= 0 && b < 100; c--, b++) {
                e.points.push({
                    timestamp: moment(a.points[c][0]).format("YYYY-MM-DD HH:mm:ss"),
                    latitude: a.points[c][1],
                    longitude: a.points[c][2],
                    altitude: a.points[c][3],
                    accuracy: a.points[c][4],
                    distance: a.points[c][5]
                })
            }
        }
        return e
    },
    gpsSendToServer: function (track, trackUUID, checkServerButtons, resubmit) {
        var currentTrack = vr_device.localStorage.getItem("manGPSCurrentTrack");
        if (currentTrack) {
            currentTrack = JSON.parse(currentTrack)
        }
        var overrideTimeout = track.serverInterval > 5 ? track.serverInterval * 60000 : 300000;
        if (!currentTrack || currentTrack.sendingToServer == false || track.serverLastSentAt == null || ((new Date()).getTime() - track.serverLastSentAt) >= overrideTimeout) {
            var data = $.extend({
                serverToken: track.serverToken,
                resubmit: resubmit
            }, volunteerRescue.gpsBuildData(track));
            if (currentTrack) {
                currentTrack.sendingToServer = true;
                vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(currentTrack))
            }
            $.ajax({
                url: track.serverURL + "/api/1_1/me_gps_point",
                async: true,
                cache: false,
                type: "PUT",
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                success: function (json) {
                    var apiResponse = eval(json);
                    if (apiResponse.result == true) {
                        var tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
                        tracks[trackUUID].serverPointsSent += apiResponse.pointsAdded;
                        tracks[trackUUID].serverLastSentAt = (new Date()).getTime();
                        if (tracks[trackUUID].serverPointsSent > tracks[trackUUID].points.length) {
                            tracks[trackUUID].serverPointsSent = tracks[trackUUID].points.length
                        }
                        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(tracks));
                        if ($.mobile.activePage.attr("id") == "manTL_page") {
                            $("#manTL_item_" + currentTrack.trackUUID).html(manTL_buildItem(tracks[currentTrack.trackUUID], currentTrack.trackUUID));
                            $("#manTLV_lstTracks").listview("refresh")
                        }
                    }
                },
                complete: function () {
                    var currentTrack = vr_device.localStorage.getItem("manGPSCurrentTrack");
                    if (currentTrack) {
                        currentTrack = JSON.parse(currentTrack);
                        currentTrack.sendingToServer = false;
                        vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(currentTrack))
                    }
                    if (checkServerButtons == true) {
                        manTLV_checkServerButtons(true)
                    }
                }
            })
        } else {
            if (checkServerButtons == true) {
                manTLV_checkServerButtons(true)
            }
        }
    },
    getDirectory: function (f, c, e) {
        var g = $.Deferred();
        var a = function (j, k, i, h) {
            j.getDirectory(k[0], {
                create: true,
                exclusive: false
            }, function (l) {
                if (k.length > 1) {
                    a(l, k.slice(1), i, h)
                } else {
                    i(l)
                }
            }, h)
        };
        var b = function (h) {
            //console.log(e + ": [" + h.code + "]");
            g.reject()
        };
        try {
            window.resolveLocalFileSystemURL(f, function (h) {
                a(h, c.split("/"), g.resolve, b)
            }, b)
        } catch (d) {
            b(d)
        }
        return g
    },
    getDirectoryFileList: function (e, b, d) {
        var f = $.Deferred();
        var a = function (g) {
           // console.log(d + ": [" + g.code + "]");
            f.reject()
        };
        try {
            window.resolveLocalFileSystemURL(e + b, function (h) {
                var g = h.createReader();
                g.readEntries(function (i) {
                    f.resolve(i)
                }, a)
            }, a)
        } catch (c) {
            a(c)
        }
        return f
    },
    removeDirectory: function (e, b, d) {
        var f = $.Deferred();
        var a = function (g) {
           // console.log(d + ": [" + g.code + "]");
            f.reject()
        };
        try {
            volunteerRescue.getDirectory(e, b, d).then(function (g) {
                g.removeRecursively(f.resolve, a)
            }, a)
        } catch (c) {
            a(c)
        }
        return f
    },
    checkFileExists: function (d, a, f, c) {
        var e = $.Deferred();
        try {
            window.resolveLocalFileSystemURL(d + a + "/" + f, function (g) {
                if (g.isFile === true) {
                    e.resolve(g.name)
                } else {
                    e.reject()
                }
            }, e.reject)
        } catch (b) {
            e.reject()
        }
        return e
    },
    readFile: function (e, b, g, d) {
        var f = $.Deferred();
        var a = function (h) {
            //console.log(d + ": [" + h.code + "]");
            f.reject()
        };
        try {
            window.resolveLocalFileSystemURL(e + b + "/", function (h) {
                h.getFile(g.toString(), {
                    create: false
                }, function (i) {
                    i.file(function (k) {
                        var j = new FileReader();
                        j.onloadend = function (l) {
                            if (l.target.result !== undefined || l.target.result !== null) {
                                f.resolve(g, l.target.result)
                            } else {
                                if (l.target.error !== undefined || l.target.error !== null) {
                                    a(l.target.code)
                                } else {
                                    a(-1)
                                }
                            }
                        };
                        j.readAsText(k)
                    }, a)
                }, a)
            }, a)
        } catch (c) {
            a(c)
        }
        return f
    },
    writeFile: function (d, b, g, f, c) {
        var e = $.Deferred();
        var a = function (h) {
            //console.log(c + ": [" + h.code + "]");
            e.reject()
        };
        volunteerRescue.getDirectory(d, b, c).then(function (h) {
            h.getFile(g.toString(), {
                create: true,
                exclusive: false
            }, function (i) {
                i.createWriter(function (j) {
                    j.onwriteend = function (k) {
                        if (this.error) {
                            a(this.error.code)
                        } else {
                            e.resolve()
                        }
                    };
                    j.write(f)
                }, a)
            }, a)
        }, a);
        return e
    },
    removeFile: function (e, b, g, d) {
        var f = $.Deferred();
        var a = function (h) {
           // console.log(d + ": [" + h.code + "]");
            f.reject()
        };
        try {
            window.resolveLocalFileSystemURL(e + b + "/", function (h) {
                h.getFile(g.toString(), {
                    create: false
                }, function (i) {
                    i.remove(f.resolve, a)
                }, a)
            }, a)
        } catch (c) {
            a(c)
        }
        return f
    }
};
if (!Array.prototype.filter) {
    Array.prototype.filter = function (f, b) {
        if (!((typeof f === "Function") && this)) {
            throw new TypeError()
        }
        var a = this.length >>> 0,
            e = new Array(a),
            g = 0,
            d = -1;
        if (b === undefined) {
            while (++d !== a) {
                if (d in this) {
                    if (f(t[d], d, t)) {
                        e[g++] = t[d]
                    } else {
                        while (++d !== a) {
                            if (d in this) {
                                if (f.call(b, t[d], d, t)) {
                                    e[g++] = t[d]
                                }
                            }
                        }
                    }
                }
            }
        }
        e.length = g;
        return e
    }
};