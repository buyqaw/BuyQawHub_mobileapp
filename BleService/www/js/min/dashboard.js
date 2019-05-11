/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;

var dBD_scrollOnExpand = false;
var dBD_fnCheckName = function () {
    volunteerRescue.getMeName(function () {
        // if (volunteerRescue.sites[volunteerRescue.currentSite].image) {
        //     $("#dBD_hdrSiteImage").attr("src", volunteerRescue.sites[volunteerRescue.currentSite].image)
        // }
        $("#dBD_hdrSiteDescription").text(volunteerRescue.getSiteDescription(volunteerRescue.currentSite));
        $("#dBD_hdrMemberName").text(volunteerRescue.sites[volunteerRescue.currentSite].member.name);
    })
};

var dBD_fnSelectSite = function () {
    var d;
    var c;
    var b;

    if (window.location.hostname == "volunteerrescue.org" && window.location.search) {
        c = window.location.search.substring(1).split("&");
        for (var a in c) {
            d = c[a].split("=");
            if (d[0] == "access_token") {
                volunteerRescue.sites[volunteerRescue.currentSite].accessToken = d[1]
            } else {
                if (d[0] == "expires_at") {
                    volunteerRescue.sites[volunteerRescue.currentSite].accessTokenExpires = d[1]
                } else {
                    if (d[0] == "refresh_token") {
                        volunteerRescue.sites[volunteerRescue.currentSite].refreshToken = d[1]
                    }
                }
            }
        }
        vr_device.localStorage.setItem("vrSites", JSON.stringify(volunteerRescue.sites));
        window.location.href = "https://volunteerrescue.org/app/html/dashboard.html";
    }
    window.sessionStorage.setItem("lastNavOption", "dashboard.html");
    b = window.sessionStorage.getItem("dBD_scrollTop");
    if (b != undefined) {
        $(document).scrollTop(Number(b));
    }
    window.sessionStorage.removeItem("dBD_scrollTop");
    dBD_fnCheckName();
    dBD_scrollOnExpand = true
};

var dBD_dashboardClick = function () {

    if (g_settings.websiteURL.length > 1) {
        $("#dBD_divDoesUseVR").css("display", "none");
        $("#dBD_hdrSiteDescription").text("Select site");
        $("#dBD_hdrMemberName").text("")
    }
    return false
};

$("#dBD_btnEventUpcoming, #dBD_btnEventCheckInOut").click(function () {
    
    window.sessionStorage.setItem("dBD_scrollTop", $(document).scrollTop());
    volunteerRescue.changePage($(this));
    return false
});

$("#dBD_btnExtendedPeriod").click(function () {
    if ($(this).attr("id") == "dBD_btnSpecificDate") {
        g_pageParams = {
            op: "specific"
        }
    } else {
        if ($(this).attr("id") == "dBD_btnWeekly") {
            g_pageParams = {
                op: "weekly"
            }
        }
    }
    window.sessionStorage.setItem("meUA_pageParams", JSON.stringify(g_pageParams));
    window.sessionStorage.setItem("dBD_scrollTop", $(document).scrollTop());
    volunteerRescue.changePage($(this));
    return false
});

$("#dBD_btnCustomBook").click(function () {
    if (volunteerRescue.sites[volunteerRescue.currentSite].member.customBookCount > 1) {
        $(this).attr("href", "me_custom_address_book.html")
    } else {
        g_pageParams = {
            bookId: "single",
            description: ""
        };
        window.sessionStorage.setItem("meCAB_pageParams", JSON.stringify(g_pageParams));
        $(this).attr("href", "me_custom_address_book_view.html")
    }
    window.sessionStorage.setItem("dBD_scrollTop", $(document).scrollTop());
    volunteerRescue.changePage($(this));
    return false
});


$("#dBD_btnShowMap").click(function(){
    SMSReceive.stopWatch();
    var ref = window.open('https://usngapp.org', '_blank', 'location=yes');
    ref.addEventListener('exit', function(event){
       SMSReceive.startWatch();
    });
});

$("#dBD_btnLocationTracking").click(function () {
    
    if($(this).text() == "Start Location Tracking"){
        setCurrentTrack();
        window.localStorage.setItem("trackIndex", "Open Location Tracking");
    } else {
        ////////////////////// if before see in currnetTrack ////////////////////
        if(vr_device.localStorage.getItem("manGPSCurrentTrack")){
            window.localStorage.setItem("trackIndex", "Start Location Tracking");
        } 
    }
});

var setCurrentTrack = function(){

    var manTLE_tracks;
    var cur_time = new Date();
    var b = null;
    var d;

    g_pageParams = {
        trackUUID: volunteerRescue.generateUUID(), 
        adding: true 
    };

    if(vr_device.localStorage.getItem("manGPSCurrentTrack")) return false;
    
    vr_device.localStorage.setItem("manTL_pageParams", JSON.stringify(g_pageParams));
    ////////////////////// Have in connected serve URL ///////////////////////
    var urlIndex; 
    if(!$.isArray(g_settings.websiteURL) || g_settings.websiteURL.length == 0){
        urlIndex = "-1";
    } else {
        urlIndex = g_settings.websiteURL[0];
    }
    
    manTLE_tracks = JSON.stringify({});
    if (manTLE_tracks) {
        manTLE_tracks = JSON.parse(manTLE_tracks);
    }
 
    manTLE_tracks[g_pageParams.trackUUID] = {
        description: cur_time,
        distanceFilter: 10,
        trackFor: 240,
        maximumAccuracy: 100,
        serverURL: urlIndex ,
        serverInterval:5,
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

    manTLE_tracks = volunteerRescue.sortAssociative(manTLE_tracks);
    vr_device.localStorage.setItem("manGPSTracks", JSON.stringify(manTLE_tracks));

    console.log(b != manTLE_tracks[g_pageParams.trackUUID].distanceFilter);

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
 
    return false
};

var setServerUrl = function(){
    var a
    var b = ("southeasternsearchandrescue.volunteerrescue.org").split(/\r|\n|,|\s/);
    for (a in b) {
        b[a] = 'https://' + b[a].replace(/^\s*https?:\/\/([^\s]*)\s*$/i, '$1').toLowerCase()
    }
    g_settings = {
        websiteURL: b.filter(function (c) {
            return !(!c || c == '' || c == 'https://')
        }),
        wifiOnly:false
    }
    vr_device.localStorage.setItem('vrSettings', JSON.stringify(g_settings));

    volunteerRescue.updateSites();  
    volunteerRescue.initialiseDashboard();
    initDashboard(); 
};

$("#dBD_page").on("pageshow", function (d) {
    initDashboard();
});

var initDashboard = function(){

    

    if(vr_device.localStorage.getItem("manGPSCurrentTrack")){
        $("#dBD_btnLocationTracking").text("Open Location Tracking");
    } else {
        $("#dBD_btnLocationTracking").text("Start Location Tracking");
    }

    $("img#dBD_online").attr("src", (g_onLine == true ? g_basePath + "images/online.png" : g_basePath + "images/offline.png"));

    if (g_settings.websiteURL.length != 0) {
       
        volunteerRescue.setCurrentSite(g_settings.websiteURL[0]);
        SMSReceive.startWatch(function() {
            document.addEventListener('onSMSArrive', function(e) {
                
                var receiveNotificationNum;
                var receiveNotificationKeyWord;
            
                var IncomingSMS = e.data;
                receiveNotificationNum = IncomingSMS.address;                    // receive phon num
                receiveNotificationKeyWord = IncomingSMS.body;                   // sms content
 
                if(receiveNotificationKeyWord.indexOf("EMERGENCY") != -1){
                    window.androidVolume.setSystem(100, true, function(){}, function(e) {});
                    var smsNotification = cordova.plugins.notification.local;
                    smsNotification.schedule({
                        title: receiveNotificationNum,
                        text: 'Emergency Call Out Notification',
                        sound: 'file://img/message.mp3',
                        icon: 'file://img/logo.png',
                        vibrate: true,
                        foreground: true
                    });
                    navigator.notification.alert(
                        receiveNotificationKeyWord,  // message
                        alertDismissed,              // callback
                        "Emergency Call Out Notification",      // title
                        'DONE'                       // buttonName
                    );
    
                    function alertDismissed() {
                        return;
                    }
                }
                    
            });
            
        }, function() {
            return;
        });
        dBD_fnSelectSite()
    } else {
        setTimeout(setServerUrl, 800);
    }
}