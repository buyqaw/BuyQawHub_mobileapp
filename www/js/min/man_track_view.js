/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;
var manTLV_tracks;
var manTLV_pointOffset = 0;
var manTLV_map = null;
var manTLV_latLngBounds = null;
var manTLV_connectServer = function (a) {
    if (g_onLine == false) {
        if (a) {
            volunteerRescue.messageDialog("Offline", "This option requires an online connection to the organization's VolunteerRescue service.", null)
        }
    } else {
        if (manTLV_tracks[g_pageParams.trackUUID].startedAt) {
            var b = $.extend({
                description: manTLV_tracks[g_pageParams.trackUUID].description,
                startedAt: moment(manTLV_tracks[g_pageParams.trackUUID].startedAt).format("YYYY-MM-DD HH:mm:ss")
            }, volunteerRescue.gpsBuildData(manTLV_tracks[g_pageParams.trackUUID]));
            volunteerRescue.callAPI(manTLV_tracks[g_pageParams.trackUUID].serverURL, "me_gps_tracker", "Connecting to " + volunteerRescue.getSiteDescription(manTLV_tracks[g_pageParams.trackUUID].serverURL) + "...", function (c) {
                manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
                manTLV_tracks[g_pageParams.trackUUID].serverToken = c.serverToken;
                manTLV_tracks[g_pageParams.trackUUID].serverPointsSent += c.pointsAdded;
                vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLV_tracks));
                $("#manTLV_connectServer").css("display", "none")
            }, null, null, {
                type: "PUT",
                data: b
            })
        }
    }
};
var manTLV_flushServer = function () {
    if (g_onLine == false) {
        volunteerRescue.messageDialog("Offline", "This option requires an online connection to the organization's VolunteerRescue service.", null)
    } else {
        manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
        if (manTLV_tracks[g_pageParams.trackUUID].serverPointsSent < manTLV_tracks[g_pageParams.trackUUID].points.length) {
            $.mobile.loading("show", {
                text: "Updating server..."
            });
            volunteerRescue.gpsSendToServer(manTLV_tracks[g_pageParams.trackUUID], g_pageParams.trackUUID, true, false)
        } else {
            manTLV_checkServerButtons(false)
        }
    }
};
var manTLV_resubmitServer = function () {
    if (g_onLine == false) {
        volunteerRescue.messageDialog("Offline", "This option requires an online connection to the organization's VolunteerRescue service.", null)
    } else {
        volunteerRescue.confirmationDialog("Are you sure you want to re-submit the points from this track ?", function () {
            manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
            manTLV_tracks[g_pageParams.trackUUID].serverPointsSent = 0;
            vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLV_tracks));
            $.mobile.loading("show", {
                text: "Updating server..."
            });
            volunteerRescue.gpsSendToServer(manTLV_tracks[g_pageParams.trackUUID], g_pageParams.trackUUID, true, true)
        })
    }
};
var manTLV_checkServerButtons = function (a) {
    if (a == true) {
        $.mobile.loading("hide");
        manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"))
    }
    if (manTLV_tracks[g_pageParams.trackUUID].serverURL != "-1") {
        if (manTLV_tracks[g_pageParams.trackUUID].startedAt && !manTLV_tracks[g_pageParams.trackUUID].serverToken) {
            $("#manTLV_btnConnectServer").off("click", manTLV_connectServer).on("click", manTLV_connectServer);
            $("#manTLV_connectServer").css("display", "block")
        } else {
            $("#manTLV_connectServer").css("display", "none");
            if (manTLV_tracks[g_pageParams.trackUUID].serverPointsSent < manTLV_tracks[g_pageParams.trackUUID].points.length) {
                $("#manTLV_btnFlushServer").off("click", manTLV_flushServer).on("click", manTLV_flushServer);
                $("#manTLV_flushServer").css("display", "block");
                $("#manTLV_resubmitServer").css("display", "none")
            } else {
                if (manTLV_tracks[g_pageParams.trackUUID].points.length > 0) {
                    $("#manTLV_btnResubmitServer").off("click", manTLV_resubmitServer).on("click", manTLV_resubmitServer);
                    $("#manTLV_resubmitServer").css("display", "block");
                    $("#manTLV_flushServer").css("display", "none")
                } else {
                    $("#manTLV_connectServer").css("display", "none");
                    $("#manTLV_flushServer").css("display", "none");
                    $("#manTLV_resubmitServer").css("display", "none")
                }
            }
        }
    } else {
        $("#manTLV_connectServer").css("display", "none");
        $("#manTLV_flushServer").css("display", "none");
        $("#manTLV_resubmitServer").css("display", "none")
    }
};
var manTLV_scrollStart = function () {
    if (manTLV_pointOffset < manTLV_tracks[g_pageParams.trackUUID].points.length) {
        for (i = 0; i < 5 && manTLV_pointOffset < manTLV_tracks[g_pageParams.trackUUID].points.length; i++) {
            manTLV_showPoint($("#manTLV_lstPoints"), manTLV_tracks[g_pageParams.trackUUID].points[manTLV_pointOffset], false)
        }
        $("#manTLV_lstPoints").listview("refresh")
    }
    if (manTLV_pointOffset >= manTLV_tracks[g_pageParams.trackUUID].points.length) {
        $(document).off("scroll", manTLV_scrollStart);
        $("#manTLV_divLoading").css("display", "none")
    }
};
var manTLV_showPoint = function (d, a, b) {
    try {
        var g = vr_cc.formatLatLon(a[1], a[2]);
        var c = $("<div>").addClass("vr-listview-extras").append($('<div style="display:table-row;">').html('<span style="display:table-cell;">Accuracy</span>' + a[4].toString() + "m")).append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;padding-right:1em;">Altitude</span>' + a[3].toString() + "m")).append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;padding-right:1em;">Distance</span>' + a[5].toString() + "m (from previous point)"));
        if (manTLV_tracks[g_pageParams.trackUUID].showDD == true) {
            c.append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;">DD</span>' + g.dd))
        }
        if (manTLV_tracks[g_pageParams.trackUUID].showDMS == true) {
            c.append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;">DMS</span>' + g.dms))
        }
        if (manTLV_tracks[g_pageParams.trackUUID].showDDM == true) {
            c.append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;">DDM</span>' + g.ddm))
        }
        if (manTLV_tracks[g_pageParams.trackUUID].showUTM == true) {
            c.append($('<div style="display:table-row;">').css("padding-bottom", "0.25em").html('<span style="display:table-cell;">UTM</span>' + g.utm))
        }
        if (manTLV_pointOffset == 0) {
            d.empty()
        }
        if (b == true) {
            d.prepend($("<li>").append($("<div>").append($("<div>").html(new moment(a[0]).format("MMMM Do YYYY, HH:mm:ss"))).append(c)))
        } else {
            d.append($("<li>").append($("<div>").append($("<div>").html(new moment(a[0]).format("MMMM Do YYYY, HH:mm:ss"))).append(c)))
        }
    } catch (f) {}
    manTLV_pointOffset++
};

$("#manTLV_page").on("pageshow", function (){
    initManTrackView();
});

var currentTrackStatus = function(index){
    if(index == 1){
        var b = vr_device.localStorage.getItem("manGPSCurrentTrack");
        if (!b) {
            if (manTLV_tracks[g_pageParams.trackUUID].points.length > 0) {
                var a = manTLV_tracks[g_pageParams.trackUUID].points[0];
                b = {
                    trackUUID: g_pageParams.trackUUID,
                    distanceFilter: manTLV_tracks[g_pageParams.trackUUID].distanceFilter,
                    sendingToServer: false,
                    lastLatitude: a[1],
                    lastLongitude: a[2],
                    lastAltitude: a[3],
                    lastDistance: 0
                }
            } else {
                b = {
                    trackUUID: g_pageParams.trackUUID,
                    distanceFilter: manTLV_tracks[g_pageParams.trackUUID].distanceFilter,
                    sendingToServer: false,
                    lastLatitude: null,
                    lastLongitude: null,
                    lastAltitude: null,
                    lastDistance: 0
                }
            }
            vr_device.startTracking(b);
            vr_device.localStorage.setItem("manGPSCurrentTrack", JSON.stringify(b));
            $("#manTLV_btnStart").css("display", "none");
            $("#manTLV_btnStop").css("display", "block");
            manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
            if (!manTLV_tracks[g_pageParams.trackUUID].startedAt) {
                manTLV_tracks[g_pageParams.trackUUID].startedAt = (new Date()).getTime()
            }
            manTLV_tracks[g_pageParams.trackUUID].stoppedAt = null;
            vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLV_tracks));
            if (manTLV_tracks[g_pageParams.trackUUID].serverURL != "-1" && !manTLV_tracks[g_pageParams.trackUUID].serverToken) {
                manTLV_connectServer(null)
            }
            //window.sessionStorage.setItem("locationTracking_Status", "Stop LocationTracking");
        }
    } else {
        var a = vr_device.localStorage.getItem("manGPSCurrentTrack");
        if (a) {
            a = JSON.parse(a);
            if (a.trackUUID == g_pageParams.trackUUID) {
                $("#manTLV_btnStart").css("display", "block");
                $("#manTLV_btnStop").css("display", "none");
                vr_device.stopTracking(a);
                manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
                if (!manTLV_tracks[g_pageParams.trackUUID].stoppedAt) {
                    manTLV_tracks[g_pageParams.trackUUID].stoppedAt = (new Date()).getTime();
                    vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLV_tracks))
                }
                if (g_onLine == true && manTLV_tracks[g_pageParams.trackUUID].serverURL != "-1" && manTLV_tracks[g_pageParams.trackUUID].serverToken) {
                    $.mobile.loading("show", {
                        text: "Updating server..."
                    });
                    volunteerRescue.gpsSendToServer(manTLV_tracks[g_pageParams.trackUUID], g_pageParams.trackUUID, true, false)
                }
                vr_device.localStorage.removeItem("manGPSCurrentTrack")
            }
        
        }
    }
};

var initManTrackView = function(){
    var b = $("#manTLV_lstPoints");
    var a;
    var c;
    vr_device.googleAnalytics();
    g_pageParams = JSON.parse(vr_device.localStorage.getItem("manTL_pageParams"));
    manTLV_tracks = vr_device.localStorage.getItem("manGPSTracks");

    if (manTLV_tracks) {
        manTLV_tracks = JSON.parse(manTLV_tracks)
    }
    if (!manTLV_tracks || (g_pageParams.adding == false && !manTLV_tracks[g_pageParams.trackUUID])) {
        window.history.back()
    }

    $("#manTLV_pageTitle").text(manTLV_tracks[g_pageParams.trackUUID].description);
    $("img#manTLV_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));
    $(b).empty();

    if (manTLV_tracks[g_pageParams.trackUUID].points.length > 0) {
        for (a = 0, manTLV_pointOffset = 0; a < 20 && a < manTLV_tracks[g_pageParams.trackUUID].points.length; a++) {
            manTLV_showPoint(b, manTLV_tracks[g_pageParams.trackUUID].points[manTLV_pointOffset], false)
        }
        if (manTLV_pointOffset < manTLV_tracks[g_pageParams.trackUUID].points.length) {
            $(document).off("scroll", manTLV_scrollStart).on("scroll", manTLV_scrollStart)
        } else {
            $("#manTLV_divLoading").css("display", "none")
        }
    } else {
        $("#manTLV_divLoading").css("display", "none");
        $(b).append("<li>There are no gps points for this track.</li>")
    }
    manTLV_checkServerButtons(false);
    c = vr_device.localStorage.getItem("manGPSCurrentTrack");
    if (g_onLine == false) {
        $("#manTLV_btnShowMap").addClass("ui-disabled")
    } else {
        $("#manTLV_btnShowMap").removeClass("ui-disabled")
    }

    if (vr_device.supportGPSTracker == true) {
        if (manTLV_tracks[g_pageParams.trackUUID].serverURL != "-1") {
            $("#manTLV_siteDescription").css("display", "block").text("Server: " + volunteerRescue.getSiteDescription(manTLV_tracks[g_pageParams.trackUUID].serverURL))
        } else {
            $("#manTLV_siteDescription").css("display", "block")
        }
        if (!c) {
            $("#manTLV_btnStop").css("display", "none");
            if (manTLV_tracks[g_pageParams.trackUUID].startedAt == null || (((new Date()).getTime() - manTLV_tracks[g_pageParams.trackUUID].startedAt) / 3600000) < manTLV_tracks[g_pageParams.trackUUID].trackFor) {
                $("#manTLV_btnStart").css("display", "block");
                $("#manTLV_clearTrack").css("display", "none")
            } else {
                $("#manTLV_btnStart").css("display", "none");
                $("#manTLV_clearTrack").css("display", "block")
            }
        } else {
            c = JSON.parse(c);
            $("#manTLV_btnStart").css("display", "none");
            if (c.trackUUID == g_pageParams.trackUUID) {
                $("#manTLV_btnStop").css("display", "block")
            } else {
                $("#manTLV_btnStop").css("display", "none")
            }
        }
    } else {
        $("#manTLV_btnStart").css("display", "none");
        $("#manTLV_btnStop").css("display", "none")
    }
    $(b).listview("refresh")

    var curLocationButtonText = window.localStorage.getItem("trackIndex");

    if(curLocationButtonText == "Start Location Tracking"){
       // currentTrackStatus(0);
    } else {
        currentTrackStatus(1);
    }

};

$("#manTLV_btnClear").click(function () {
    volunteerRescue.confirmationDialog("Are you sure you want to clear all the points from this track ?", function () {
        $("#manTLV_btnStop").click();
        manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
        manTLV_tracks[g_pageParams.trackUUID].points = [];
        manTLV_tracks[g_pageParams.trackUUID].startedAt = null;
        manTLV_tracks[g_pageParams.trackUUID].stoppedAt = null;
        manTLV_tracks[g_pageParams.trackUUID].serverToken = null;
        manTLV_tracks[g_pageParams.trackUUID].serverLastSentAt = null;
        manTLV_tracks[g_pageParams.trackUUID].serverPointsSent = 0;
        manTLV_tracks[g_pageParams.trackUUID].totalDistance = 0;
        vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLV_tracks));
        manTLV_pointOffset = 0;
        $("#manTLV_connectServer").css("display", "none");
        $("#manTLV_flushServer").css("display", "none");
        $("#manTLV_resubmitServer").css("display", "none");
        $("#manTLV_divLoading").css("display", "none");
        $("#manTLV_clearTrack").css("display", "none");
        if (vr_device.supportGPSTracker == true) {
            $("#manTLV_btnStart").css("display", "block")
        }
        $("#manTLV_lstPoints").empty().append("<li>There are no gps points for this track.</li>").listview("refresh")
    }, function () {})
});

$("#manTLV_btnKML").click(function () {
    var d = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
    var c = d[g_pageParams.trackUUID].description.replace(/[^a-z0-9]/gi, "_") + "_" + moment().format("YYYYMMDDHHmmss") + ".kml";
    var f = function (g) {
        $.mobile.loading("hide");
        volunteerRescue.messageDialog("KML error", "Failed to create KML file " + c + ".  Error code: " + g.code)
    };
    $.mobile.loading("show", {
        text: "Creating KML file..."
    });
    var a = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>' + d[g_pageParams.trackUUID].description + '</name>\n    <description>VolunteerRescue KML export</description>\n    <Style id="volunteerRescuePoly">\n      <LineStyle>\n        <color>501400FF</color>\n        <width>4</width>\n      </LineStyle>\n    </Style>\n    <Placemark>\n      <name>' + d[g_pageParams.trackUUID].description + "</name>\n      <styleUrl>volunteerRescuePoly</styleUrl>\n      <LineString>\n        <coordinates>\n";
    for (var e = d[g_pageParams.trackUUID].points.length - 1; e >= 0; e--) {
        a += d[g_pageParams.trackUUID].points[e][2] + "," + d[g_pageParams.trackUUID].points[e][1] + "," + d[g_pageParams.trackUUID].points[e][3] + "\n"
    }
    a += "        </coordinates>\n      </LineString>\n    </Placemark>\n  </Document>\n</kml>\n";
    if (g_isNativeApp == true) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (g) {
            g.root.getDirectory("VolunteerRescue", {
                create: true,
                exclusive: false
            }, function (h) {
                h.getFile(c, {
                    create: true,
                    exclusive: false
                }, function (j) {
                    j.createWriter(function (k) {
                        k.onwrite = function () {
                            $.mobile.loading("hide");
                            volunteerRescue.messageDialog("KML Write", "The KML file " + c + " has been created.")
                        };
                        k.onerror = f;
                        k.write(a)
                    })
                }, f)
            }, f)
        }, f)
    } else {
        var b = new Blob([a], {
            type: "application/vnd.google-earth.kml+xml"
        });
        yepnope({
            load: "../js/min/filesaver.js",
            complete: function () {
                $.mobile.loading("hide");
                saveAs(b, c)
            }
        })
    }
});

$("#manTLV_btnEmail").click(function () {
    var b = "",
        a = [],
        g = "";
    var e = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
    var d = "track_" + e[g_pageParams.trackUUID].description.replace(/[^a-z0-9]/gi, "_") + "_" + moment().format("YYYY-MM-DD_HH-mm-ss") + ".gpx";
    g = '<?xml version="1.0" encoding="UTF-8"?>' + vr_device.lineFeed + '<gpx creator="VolunteerRescue Mobile App" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">' + vr_device.lineFeed + "  <metadata>" + vr_device.lineFeed + "    <time>" + moment().format("YYYY-MM-DDTHH:mm:ssZ") + "</time>" + vr_device.lineFeed + "  </metadata>" + vr_device.lineFeed + "  <trk>" + vr_device.lineFeed + "    <name>" + e[g_pageParams.trackUUID].description + "</name>" + vr_device.lineFeed + "    <trkseg>" + vr_device.lineFeed;
    for (var f = e[g_pageParams.trackUUID].points.length - 1; f >= 0; f--) {
        g += '      <trkpt lat="' + e[g_pageParams.trackUUID].points[f][1] + '" lon="' + e[g_pageParams.trackUUID].points[f][2] + '">' + vr_device.lineFeed + "        <ele>" + e[g_pageParams.trackUUID].points[f][3] + "</ele>" + vr_device.lineFeed + "      </trkpt>" + vr_device.lineFeed
    }
    g += "    </trkseg>" + vr_device.lineFeed + "  </trk>" + vr_device.lineFeed + "</gpx>" + vr_device.lineFeed;
    if (g_isNativeApp == true) {
        $.mobile.loading("show", {
            text: "E-mailing track..."
        });
        b += "<h2>" + e[g_pageParams.trackUUID].description + "</h2><div>";
        a.push("base64:" + d + "//" + btoa(g));
        cordova.plugins.email.open({
            app: null,
            subject: "VolunteerRescue mobile application GPX track",
            body: b,
            attachments: a,
            isHtml: true
        }, function () {
            $.mobile.loading("hide")
        })
    } else {
        var c = new Blob([g], {
            type: "application/gpx+xml"
        });
        yepnope({
            load: "../js/min/filesaver.js",
            complete: function () {
                $.mobile.loading("hide");
                saveAs(c, d)
            }
        })
    }
});

$("#manTLV_btnShowMap").click(function () {
    $("this").addClass("ui-disabled");
    if (manTLV_map == null) {
        $("#manTLV_mapCanvas").css("display", "block");
        if (typeof google == "undefined") {
            var a = document.createElement("script");
            a.type = "text/javascript";
            a.async = true;
            a.src = "https://maps-api-ssl.google.com/maps/api/js?key=AIzaSyBDQfGuTaIZxmRmQ5BCgZdQba8qoWdeUvY&sensor=false&callback=manTLV_mapsApiLoaded";
            document.body.appendChild(a)
        } else {
            manTLV_mapsApiLoaded()
        }
    } else {
        manTLV_mapsApiLoaded()
    }
    return false
});

var manTLV_mapsApiLoaded = function () {
    if (manTLV_map == null) {
        var b = [];
        var c;
        manTLV_map = new google.maps.Map($("#manTLV_mapCanvas")[0], {
            zoom: 10,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            panControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE
            },
            scaleControl: false
        });
        manTLV_tracks = JSON.parse(vr_device.localStorage.getItem("manGPSTracks"));
        manTLV_latLngBounds = new google.maps.LatLngBounds();
        for (var a = manTLV_tracks[g_pageParams.trackUUID].points.length - 1; a >= 0; a--) {
            c = new google.maps.LatLng(manTLV_tracks[g_pageParams.trackUUID].points[a][1], manTLV_tracks[g_pageParams.trackUUID].points[a][2]);
            manTLV_latLngBounds.extend(c);
            b.push(c)
        }
        manTLV_path = new google.maps.Polyline({
            path: b,
            visible: true,
            map: manTLV_map,
            strokeColor: "#990000",
            strokeOpacity: 1,
            strokeWeight: 2,
            geodesic: true
        });
        manTLV_map.fitBounds(manTLV_latLngBounds)
    }
};