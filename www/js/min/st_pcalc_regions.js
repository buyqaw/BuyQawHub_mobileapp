/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var stPCR_searches;var stPCR_setPageParamsHandler=function(){$.extend(g_pageParams,{regionId:$(this).attr("data-vr-id")?$(this).attr("data-vr-id"):-1});window.sessionStorage.setItem("stPCS_pageParams",JSON.stringify(g_pageParams));$.mobile.changePage($(this).attr("href"));return false};$("#stPCR_page").on("pageshow",function(){var c=$("#stPCR_lstRegions");var b;var a;vr_device.googleAnalytics();g_pageParams=JSON.parse(window.sessionStorage.getItem("stPCS_pageParams"));stPCR_searches=vr_device.localStorage.getItem("stSearches");if(stPCR_searches){stPCR_searches=JSON.parse(stPCR_searches)}if(!g_pageParams||!stPCR_searches||!stPCR_searches[g_pageParams.searchUUID]){window.history.back()}else{$("img#stPCR_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));$("#stPCR_pageTitle").text(g_pageParams.description+" - Regions");if(stPCR_searches[g_pageParams.searchUUID].completedSearches.length>0){$("#stPCR_btnAddRegion").css("display","none")}$(c).empty();if(stPCR_searches[g_pageParams.searchUUID].regionCount>0){for(b in stPCR_searches[g_pageParams.searchUUID].regions){a=$("<div>").append($("<div>").html(stPCR_searches[g_pageParams.searchUUID].regions[b].description));$(c).append($("<li>").append($("<a>").attr("href","st_pcalc_region_edit.html").attr("data-vr-id",b).click(stPCR_setPageParamsHandler).append(a)))}}else{$(c).append("<li>You have not created any regions.</li>")}$(c).listview("refresh")}$("#stPCR_btnAddRegion").click(stPCR_setPageParamsHandler)});