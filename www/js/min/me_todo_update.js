/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var meTDU_setPageParamsHandler=function(){var a=$(this).attr("data-vr-tduid");$.extend(g_pageParams,{todoUpdateId:a?a:-1});window.sessionStorage.setItem("meTD_pageParams",JSON.stringify(g_pageParams));volunteerRescue.changePage($(this));return false};$("#meTDU_page").on("pageshow",function(){vr_device.googleAnalytics();g_pageParams=JSON.parse(window.sessionStorage.getItem("meTD_pageParams"));$("img#meTDU_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));volunteerRescue.callAPI(volunteerRescue.currentSite,"me_todo/"+g_pageParams.todoId,"Retrieving todo updates...",function(d){var e=$("#meTDU_lstToDoUpdate");var a;var b;var c;$(e).empty();if(d.todoUpdates.length>0){for(b in d.todoUpdates){if(d.todoUpdates[b].canUpdate==true){c=$("<a>").attr("href","me_todo_update_edit.html").attr("data-vr-tduid",d.todoUpdates[b].todoUpdateId);c.click(meTDU_setPageParamsHandler)}else{c=$("<div>")}a=$("<li>").append(c);c.append($("<div>").text("Description: "+d.todoUpdates[b].description)).append($("<div>").text("Status: "+d.todoUpdates[b].status)).append($("<div>").text("Hours: "+d.todoUpdates[b].hours)).append($("<div>").text("Completed by: "+d.todoUpdates[b].completedBy));$(e).append($("<li>",{"data-role":"list-divider","data-theme":"b"}).text("Completed at: "+d.todoUpdates[b].completedAt)).append(a)}}else{$(e).append("<li>No updates for this item.</li>")}$(e).listview("refresh");$("#meTDU_hdrTodoDetails").text(g_pageParams.description)});$("#meTDU_btnAddUpdate").click(meTDU_setPageParamsHandler)});