/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var rRF_calculateClickHandler=function(){var c=$("#rRF_forceAB").val();var b=$("#rRF_angleA").val();if(c&&b){var a=Math.sqrt(c*c+c*c-2*c*c*Math.cos(b*Math.PI/180));$("#rRF_forceR").val(Math.round(a*1000)/1000)}else{volunteerRescue.messageDialog("Error","The following errors occured<ul><li>You must enter values for both angle a and force.</li></ul>",null)}};var rRF_resetClickHandler=function(){$("#rRF_forceAB").val("");$("#rRF_angleA").val("");$("#rRF_forceR").val("")};$("#rRF_page").on("pageshow",function(){$("img#rRF_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));$("#rRF_calculate").off("click",rRF_calculateClickHandler).on("click",rRF_calculateClickHandler);$("#rRF_reset").off("click",rRF_resetClickHandler).on("click",rRF_resetClickHandler)});