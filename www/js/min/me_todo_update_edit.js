/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var meTDUE_saveClickHandler=function(a){var b=volunteerRescue.checkFields(a,"meTDUE_");if(b==true){volunteerRescue.callAPI(volunteerRescue.currentSite,"me_todo/"+g_pageParams.todoId+"/"+g_pageParams.todoUpdateId,"Saving...",function(c){window.history.back()},null,null,{type:g_pageParams.todoUpdateId!=-1?"PUT":"POST",data:{description:$("#meTDUE_description").val(),status:$("#meTDUE_status").val(),hours:$("#meTDUE_hours").val(),completedAtDate:$("#meTDUE_completedAtDate").val(),completedAtTime:$("#meTDUE_completedAtTime").val()}})}return false};var meTDUE_deleteClickHandler=function(a){volunteerRescue.confirmationDialog("Are you sure you want to delete the update ?",function(){volunteerRescue.callAPI(volunteerRescue.currentSite,"me_todo/"+g_pageParams.todoId+"/"+g_pageParams.todoUpdateId,"Deleting...",function(b){window.history.back()},null,null,{type:"DELETE"})},function(){});return false};$("#meTDUE_page").on("pageshow",function(){vr_device.googleAnalytics();g_pageParams=JSON.parse(window.sessionStorage.getItem("meTD_pageParams"));$("img#meTDUE_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));volunteerRescue.callAPI(volunteerRescue.currentSite,"me_todo/"+g_pageParams.todoId+"/"+g_pageParams.todoUpdateId,"Retrieving details...",function(b){var a;var c=$("#meTDUE_status");for(a in b.todoStatuses){c.append($('<option value="'+a+'">'+b.todoStatuses[a]+"</option>"))}volunteerRescue.populateFields(b.todoUpdate,"meTDUE_");c.selectmenu("refresh",true);$("#meTDUE_deleteForm").off("click",meTDUE_deleteClickHandler).on("click",meTDUE_deleteClickHandler);$("#meTDUE_submitForm").off("click",meTDUE_saveClickHandler).on("click",{apiResponse:b.todoUpdate},meTDUE_saveClickHandler);$("#meTDUE_form").submit({apiResponse:b.todoUpdate},meTDUE_saveClickHandler)});$("#meTDUE_deleteForm").css("display",(g_pageParams.todoUpdateId!=-1?"inline-block":"none"))});$(document).on("pagecreate create",volunteerRescue.setDateFields);