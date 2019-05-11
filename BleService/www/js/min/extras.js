/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;$("#extras_page").on("pageshow",function(a,b){vr_device.googleAnalytics();$("img#extras_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));window.sessionStorage.setItem("lastNavOption","extras.html")});