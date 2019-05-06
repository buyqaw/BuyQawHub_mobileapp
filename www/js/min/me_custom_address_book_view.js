/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc.
 * http://volunteerrescue.org/app_license
 */
var meCABV_fnPopup = function (c) {
  var a = $('#meCABV_lstPopupCustomDetails')
  var b
  var d
  b =
    '<li data-role="list-divider" style="font-size:1em;"><div>' +
    c.name +
    '</div>'
  if (c.company) {
    b += '<div class="vr-listview-extras">' + c.company + '</div>'
  }
  b += '<div class="vr-listview-extras">' + c.type + '</div></li>'
  if (c.homePhone) {
    if (c.phonePrimary == '2') {
      d = ' data-theme="a" data-icon="star"'
    } else {
      d = ''
    }
    b +=
      '<li' +
      d +
      '><a href="tel:' +
      c.homePhone +
      '">Home: ' +
      c.homePhone +
      '</a></li>'
  }
  if (c.cellPhone) {
    if (c.phonePrimary == '1') {
      d = ' data-theme="a" data-icon="star"'
    } else {
      d = ''
    }
    b +=
      '<li' +
      d +
      '><a href="tel:' +
      c.cellPhone +
      '">Cell: ' +
      c.cellPhone +
      '</a></li>'
  }
  if (c.workPhone) {
    if (c.phonePrimary == '3') {
      d = ' data-theme="a" data-icon="star"'
    } else {
      d = ''
    }
    b +=
      '<li' +
      d +
      '><a href="tel:' +
      c.workPhone +
      '">Work: ' +
      c.workPhone +
      '</a></li>'
  }
  if (c.email) {
    b += '<li><a href="mailto:' + c.email + '">E-mail: ' + c.email + '</a></li>'
  }
  $(a)
    .empty()
    .append(b)
    .listview('refresh')
  $('#meCABV_popupMeCustomDetails').popup('open')
}
$('#meCABV_page').on('pageshow', function () {
  vr_device.googleAnalytics()
  g_pageParams = JSON.parse(window.sessionStorage.getItem('meCAB_pageParams'))
  if (g_pageParams.description) {
    $('#meCABV_pageTitle').text(g_pageParams.description)
  }
  $('img#meCABV_online').attr(
    'src',
    g_onLine == true
      ? g_basePath + 'images/online.png'
      : g_basePath + 'images/offline.png'
  )
  volunteerRescue.callAPI(
    volunteerRescue.currentSite,
    'me_custom_address_book/' + g_pageParams.bookId,
    'Retrieving address book items...',
    function (c) {
      var b = $('#meCABV_lstCustomBook')
      var d
      $(b).empty()
      if (c.addressBook) {
        $('#meCABV_pageTitle').text(c.addressBook)
      }
      for (var a in c.customBookItems) {
        if (c.customBookItems[a].divider == true) {
          $(b).append(
            $('<li>', {
              'data-role': 'list-divider',
              'data-theme': 'b',
              text: c.customBookItems[a].title
            })
          )
        } else {
          d = $('<div>').append(
            $('<div>')
              .addClass('vr-listview-extras')
              .css({ float: 'right' })
              .html(c.customBookItems[a].type)
          )
          d.append($('<div>').html(c.customBookItems[a].name))
          if (c.customBookItems[a].company) {
            d.append(
              $('<div>')
                .addClass('vr-listview-extras')
                .html(c.customBookItems[a].company)
            )
          }
          $(b).append(
            $('<li>')
              .html(d)
              .attr('data-vr-index', a)
              .on('click', function () {
                meCABV_fnPopup(c.customBookItems[$(this).attr('data-vr-index')])
              })
          )
        }
      }
      $(b).listview('refresh')
    }
  )
})
