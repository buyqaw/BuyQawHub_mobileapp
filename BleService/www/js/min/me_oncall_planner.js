/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var meOCP_setPageParamsHandler=function(){g_pageParams={icsRoleId:$(this).attr("data-vr-iid"),description:$(this).attr("data-vr-ics-role")};window.sessionStorage.setItem("meOCP_pageParams",JSON.stringify(g_pageParams));volunteerRescue.changePage($(this));return false};$("#meOCP_page").on("pageshow",function(){vr_device.googleAnalytics();$("img#meOCP_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));volunteerRescue.callAPI(volunteerRescue.currentSite,"me_oncall_planner","Retrieving ICS roles...",function(c){var b=$("#meOCP_lstICSRoles");var a;$(b).empty();if(c.icsRole.length>0){for(a in c.icsRole){$(b).append($("<li>").append($("<a>",{href:"me_oncall_planner_view.html","data-vr-iid":c.icsRole[a].icsRoleId,"data-vr-ics-role":c.icsRole[a].description,text:c.icsRole[a].description}).click(meOCP_setPageParamsHandler)))}}else{$(b).append("<li>There are no ICS roles you can view shifts for.</li>")}$(b).listview("refresh")})});