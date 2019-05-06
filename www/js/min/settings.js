/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc.
 * http://volunteerrescue.org/app_license
 */
var set_saveClickHandler = function () {
  var a

  var b = $('#set_txtWebsiteUrl')
    .val()
    .split(/\r|\n|,|\s/)
  for (a in b) {
    b[a] =
      'https://' +
      b[a].replace(/^\s*https?:\/\/([^\s]*)\s*$/i, '$1').toLowerCase()
  }
  g_settings = {
    websiteURL: b.filter(function (c) {
      return !(!c || c == '' || c == 'https://')
    }),
    wifiOnly: $('#set_chkWifiOnly').prop('checked')
  }
  vr_device.localStorage.setItem('vrSettings', JSON.stringify(g_settings))
  volunteerRescue.updateSites()
}
$('#set_page').on('pageshow', function () {
  vr_device.googleAnalytics()
  $('img#set_online').attr(
    'src',
    g_onLine == true
      ? g_basePath + 'images/online.png'
      : g_basePath + 'images/offline.png'
  )
  $('#set_txtWebsiteUrl').val(g_settings.websiteURL.join('\n'))
  $('#set_chkWifiOnly')
    .prop('checked', g_settings.wifiOnly)
    .checkboxradio('refresh', true)
  $('#set_saveForm')
    .off('click', set_saveClickHandler)
    .on('click', set_saveClickHandler)
  $('#set_form').submit(set_saveClickHandler)
})
