/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var stPCE_searches;var stPCE_setPageParamsHandler=function(){$.extend(g_pageParams,{evaluatorId:$(this).attr("data-vr-id")?$(this).attr("data-vr-id"):-1});window.sessionStorage.setItem("stPCS_pageParams",JSON.stringify(g_pageParams));$.mobile.changePage($(this).attr("href"));return false};$("#stPCE_page").on("pageshow",function(){var c=$("#stPCE_lstEvals");var b;var a;vr_device.googleAnalytics();g_pageParams=JSON.parse(window.sessionStorage.getItem("stPCS_pageParams"));stPCE_searches=vr_device.localStorage.getItem("stSearches");if(stPCE_searches){stPCE_searches=JSON.parse(stPCE_searches)}if(!g_pageParams||!stPCE_searches||!stPCE_searches[g_pageParams.searchUUID]){window.history.back()}else{$("img#stPCE_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));$("#stPCE_pageTitle").text(g_pageParams.description+" - Evaluators");if(stPCE_searches[g_pageParams.searchUUID].completedSearches.length>0){$("#stPCE_btnAddEval").css("display","none")}$(c).empty();if(stPCE_searches[g_pageParams.searchUUID].evaluatorCount>0){for(b in stPCE_searches[g_pageParams.searchUUID].evaluators){a=$("<div>").append($("<div>").html(stPCE_searches[g_pageParams.searchUUID].evaluators[b].description));$(c).append($("<li>").append($("<a>").attr("href","st_pcalc_eval_edit.html").attr("data-vr-id",b).click(stPCE_setPageParamsHandler).append(a)))}}else{$(c).append("<li>You have not created any evaluators.</li>")}$(c).listview("refresh")}$("#stPCE_btnAddEval").click(stPCE_setPageParamsHandler)});