/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var meCAB_setPageParamsHandler=function(){g_pageParams={bookId:$(this).attr("data-vr-abid"),description:$(this).attr("data-vr-book")};window.sessionStorage.setItem("meCAB_pageParams",JSON.stringify(g_pageParams));volunteerRescue.changePage($(this));return false};$("#meCAB_page").on("pageshow",function(){vr_device.googleAnalytics();$("img#meCAB_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));volunteerRescue.callAPI(volunteerRescue.currentSite,"me_custom_address_book","Retrieving custom address books...",function(c){var b=$("#meCAB_lstCustomBooks");var a;$(b).empty();if(c.customBook.length>0){for(a in c.customBook){$(b).append($("<li>").append($("<a>",{href:"me_custom_address_book_view.html","data-vr-abid":c.customBook[a].bookId,"data-vr-book":c.customBook[a].description,text:c.customBook[a].description}).click(meCAB_setPageParamsHandler)))}}else{$(b).append("<li>You have no custom address books.</li>")}$(b).listview("refresh")})});