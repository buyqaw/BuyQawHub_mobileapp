/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc.
 * http://volunteerrescue.org/app_license
 */
var dmEL_accounts
var dmEL_setPageParamsHandler = function () {
  $.extend(g_pageParams, {
    id: $(this).attr('data-vr-id') ? $(this).attr('data-vr-id') : -1,
    password: $('#importPassword-' + $(this).attr('data-vr-id')).val()
  })
  window.sessionStorage.setItem('dM_pageParams', JSON.stringify(g_pageParams))
  $.mobile.changePage(
    g_pageParams.exporting == true ? 'dm_export.html' : 'dm_import.html'
  )
  return false
}
$('#dmEL_page').on('pageshow', function () {
  var lstExports = $('#dmEL_lstExports')
  vr_device.googleAnalytics()
  g_pageParams = JSON.parse(window.sessionStorage.getItem('dM_pageParams'))
  dmEL_accounts = vr_device.localStorage.getItem('vrAccounts')
  if (dmEL_accounts) {
    dmEL_accounts = JSON.parse(dmEL_accounts)
  }
  if (!dmEL_accounts || !dmEL_accounts[g_pageParams.accountEmail]) {
    window.history.back()
  }
  $('img#dmEL_online').attr(
    'src',
    g_onLine == true
      ? g_basePath + 'images/online.png'
      : g_basePath + 'images/offline.png'
  )
  $(lstExports)
    .empty()
    .listview('refresh')
  $('#dmEL_btnAddExport').css('display', 'none')
  $.mobile.loading('show', { text: 'Retrieving data set...' })
  $.ajax({
    url: 'https://volunteerrescue.org/api/app/export',
    type: 'POST',
    data: {
      action: 'read',
      emailAddress: g_pageParams.accountEmail,
      uuid: dmEL_accounts[g_pageParams.accountEmail].uuid
    },
    async: true,
    cache: false,
    success: function (json) {
      var apiResponse = eval(json)
      var errors = ''
      var i
      var itemBody
      var extras
      $.mobile.loading('hide')
      if (apiResponse.result == true) {
        if (apiResponse.exports.length > 0) {
          $('#dmEL_btnAddExport').css(
            'display',
            g_pageParams.exporting == true && apiResponse.exports.length < 5
              ? 'block'
              : 'none'
          )
          for (i in apiResponse.exports) {
            itemBody = $('<div>').append(
              $('<div>').html(apiResponse.exports[i].description)
            )
            extras = $('<div>')
              .addClass('vr-listview-extras')
              .append($('<div>').html(apiResponse.exports[i].exportedAt))
              .append(
                $('<div>').html(
                  (apiResponse.exports[i].publicExport == true
                    ? 'Public'
                    : 'Private') + ' export'
                )
              )
            if (apiResponse.exports[i].passwordProtected == true) {
              extras.append($('<div>').html('Password protected'))
              if (apiResponse.exports[i].passwordRequired == true) {
                extras.append(
                  $('<input>')
                    .attr({
                      type: 'text',
                      id: 'importPassword-' + apiResponse.exports[i].id
                    })
                    .click(function () {
                      return false
                    })
                )
              }
            }
            $(lstExports).append(
              $('<li>').append(
                $('<a>')
                  .attr({ href: '#', 'data-vr-id': apiResponse.exports[i].id })
                  .click(dmEL_setPageParamsHandler)
                  .append(itemBody.append(extras))
              )
            )
            $('[id^="importPassword-"]').textinput()
          }
        } else {
          $('#dmEL_btnAddExport').css(
            'display',
            g_pageParams.exporting == true ? 'block' : 'none'
          )
          $(lstExports).append('<li>No data sets have been created.</li>')
        }
        $(lstExports).listview('refresh')
      } else {
        for (i in apiResponse.errors) {
          errors += '<li>' + apiResponse.errors[i] + '</li>'
        }
        volunteerRescue.messageDialog(
          'Error',
          '<p>The following error(s) occurred</p><ul>' + errors + '</ul>',
          function () {
            window.history.back()
          }
        )
      }
    },
    error: function () {
      $.mobile.loading('hide')
      volunteerRescue.messageDialog(
        'Error',
        'Failed to retrieve data set.',
        null
      )
    }
  })
  $('#dmEL_pageTitle').text(
    g_pageParams.accountDescription +
      ' - ' +
      (g_pageParams.exporting == true ? 'Save to' : 'Load from') +
      ' the cloud'
  )
  $('#dmEL_btnAddExport').click(dmEL_setPageParamsHandler)
})
