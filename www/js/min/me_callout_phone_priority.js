/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var mePCPP_saveClickHandler=function(a){volunteerRescue.callAPI(volunteerRescue.currentSite,"me_callout_phone_priority","Saving...",function(b){window.history.back()},null,null,{type:"PUT",data:{memberId:$("#mePCPP_memberId").val(),primaryNumber:$("#mePCPP_primaryNumber").val(),firstAltNumber:$("#mePCPP_firstAltNumber").val(),secondAltNumber:$("#mePCPP_secondAltNumber").val(),sendText:$("#mePCPP_sendText").prop("checked"),sendPage:$("#mePCPP_sendPage").prop("checked"),sendEmail:$("#mePCPP_sendEmail").prop("checked"),additionalEmail:$("#mePCPP_additionalEmail").val()}});return false};$("#mePCPP_page").on("pageshow",function(){vr_device.googleAnalytics();$("img#mePCPP_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));volunteerRescue.callAPI(volunteerRescue.currentSite,"me_callout_phone_priority","Retrieving details...",function(a){volunteerRescue.populateFields(a,"mePCPP_");$("#mePCPP_primaryNumber").selectmenu("refresh",true);$("#mePCPP_firstAltNumber").selectmenu("refresh",true);$("#mePCPP_secondAltNumber").selectmenu("refresh",true);$("#mePCPP_sendText").checkboxradio("refresh");$("#mePCPP_sendPage").checkboxradio("refresh");$("#mePCPP_sendEmail").checkboxradio("refresh");$("#mePCPP_submitForm").off("click",mePCPP_saveClickHandler).on("click",{apiResponse:a},mePCPP_saveClickHandler);$("#mePCPP_form").submit({apiResponse:a},mePCPP_saveClickHandler)})});