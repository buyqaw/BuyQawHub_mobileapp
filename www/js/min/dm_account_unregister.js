/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var dmAU_accounts;var dmAU_unregisterCloudClickHandler=function(){volunteerRescue.confirmationDialog("Are you sure you want to unregister the account from the cloud ?",function(){$.mobile.loading("show",{text:"Unregistering account"});$.ajax({url:"https://volunteerrescue.org/api/app/unregister",type:"POST",data:{emailAddress:g_pageParams.accountEmail,uuid:dmAU_accounts[g_pageParams.accountEmail].uuid},async:true,cache:false,success:function(json){var apiResponse=eval(json);var errors="";var i;$.mobile.loading("hide");if(apiResponse.result==true){delete dmAU_accounts[g_pageParams.accountEmail],vr_device.localStorage.setItem("vrAccounts",JSON.stringify(dmAU_accounts));volunteerRescue.messageDialog("Unregistered","The account has been unregistered.",function(){window.history.back()})}else{for(i in apiResponse.errors){errors+="<li>"+apiResponse.errors[i]+"</li>"}volunteerRescue.messageDialog("Error","<p>The following error(s) occurred</p><ul>"+errors+"</ul>",null)}},error:function(){$.mobile.loading("hide");volunteerRescue.messageDialog("Error","Unable to unregister the account.",null)}})},function(){});return false};var dmAU_unregisterDeviceClickHandler=function(){volunteerRescue.confirmationDialog("Are you sure you want to unregister the account from this device ?",function(){delete dmAU_accounts[g_pageParams.accountEmail],vr_device.localStorage.setItem("vrAccounts",JSON.stringify(dmAU_accounts));window.history.back()},function(){});return false};$("#dmAU_page").on("pageshow",function(){vr_device.googleAnalytics();g_pageParams=JSON.parse(window.sessionStorage.getItem("dM_pageParams"));dmAU_accounts=vr_device.localStorage.getItem("vrAccounts");if(dmAU_accounts){dmAU_accounts=JSON.parse(dmAU_accounts)}if(!dmAU_accounts||!dmAU_accounts[g_pageParams.accountEmail]){window.history.back()}$("#dmAU_divUnregisterCloud").css("display",dmAU_accounts[g_pageParams.accountEmail].publicAccount==true?"none":"block");$("img#dmAU_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));$("#dmAU_unregisterDevice").off("click",dmAU_unregisterDeviceClickHandler).on("click",dmAU_unregisterDeviceClickHandler);$("#dmAU_unregisterCloud").off("click",dmAU_unregisterCloudClickHandler).on("click",dmAU_unregisterCloudClickHandler)});