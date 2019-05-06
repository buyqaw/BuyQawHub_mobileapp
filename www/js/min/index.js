/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc.
 * http://volunteerrescue.org/app_license
 */
var index_showExternalPage = function () {
  if (g_onLine == true) {
    window.open($(this).attr('href'), '_blank', vr_device.windowOpenOptions)
  } else {
    volunteerRescue.messageDialog(
      'Offline',
      'This option requires a connection to the internet.',
      null
    )
  }
  return false
}

var pushButton = function(){
  $("#btnDashboard").click();
};

$('#index_page').on('pageshow', function (a, b) {
  setTimeout(pushButton, 900);
  $('#index_divAbout a[href^="http"]').off('click', index_showExternalPage).on('click', index_showExternalPage)
  $('img#index_online').attr('src',g_onLine == true ? g_basePath + 'images/online.png' : g_basePath + 'images/offline.png')
})
