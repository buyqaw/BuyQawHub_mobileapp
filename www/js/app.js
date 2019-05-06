$(document).ready(function() {
    var site_url = ""

// ===========================verification======================
    $( "#verification-button" ).click(function() {
        var code = $("#verification-code").val();
        if(code == ""){
            window.open(site_url+"html/registration.html", "_self");
        }else{
            alert("invaild code!!!");
        }
      
    });
// ===========================sign up======================
    $( "#registration-button" ).click(function() {
        var name = $("#registration-name").val();
        var phone = $("#registration-phone").val();
        var position = $("#registration-position").val();
        var department = $("#registration-department").val();
        var company = $("#registration-company").val();
        if(name != ""){
            alert("incorect name");
        }else if(phone != ""){
            alert("incorret phone number");
        }else if(position != ""){
            alert("incorret position");
        }else if(department != ""){
            alert("incorret department");
        }else if(company != ""){
            alert("incorret company name");
        }else{
            window.open(site_url+"enabled.html", "_self");
        }
    });
// ===========================enabled======================
    $( "#enabled" ).click(function() {
        window.open(site_url+"disabled.html", "_self");
    });

    $( "#enabled-menu" ).click(function() {
        $("#menutop").css("display", "block");
    });
// ===========================disabled======================
    $( "#disabled" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });

    $( "#disabled-menu" ).click(function() {
        //window.open(site_url+"enabled.html", "_self");
    });
// ===========================menu======================
    $( "#menu-messages" ).click(function() {
        window.open(site_url+"message.html", "_self");
    });

    $( "#menu-buildings" ).click(function() {
        window.open(site_url+"building.html", "_self");
    });

    $( "#menu-settings" ).click(function() {
        window.open(site_url+"settings.html", "_self");
    });

    $( "#menu-home" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });
    $( "#menutop-close" ).click(function() {
       $("#menutop").css("display", "none");
    });
// ===========================buildings======================
    $( "#building-menu" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });

    $( "#building-green" ).click(function() {
        window.open(site_url+"zones.html", "_self");
    });
// ===========================green tower======================
    $( "#green-menu" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });
// ===========================messages======================
    $( "#messages-red-close" ).click(function() {
       $("#messages-red").attr("style","display:none");
    });
    
    $( "#messages-blue-close" ).click(function() {
        $("#messages-blue").attr("style","display:none");
    });

    $( "#messages-green-close" ).click(function() {
        $("#messages-green").attr("style","display:none");
    });

    $( "#messages-all" ).click(function() {
        $("#messages-red").attr("style","display:none");
        $("#messages-blue").attr("style","display:none");
        $("#messages-green").attr("style","display:none");
    });

    $( "#messages-menu" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });

    $( "#messages-red-inner" ).click(function() {
        //window.open(site_url+"onMessage.html", "_self");
        $("#message-detail").css('display','block');
    });
// ===========================onmessages======================
    $( "#messages-red-detail-close" ).click(function() {
        //window.open(site_url+"message.html", "_self");
        $("#message-detail").css('display','none');
    });
// ===========================settings======================
    $( "#settings-menu" ).click(function() {
        window.open(site_url+"enabled.html", "_self");
    });

    $( "#settings-profile" ).click(function() {
        window.open(site_url+"profile.html", "_self");
    });

    $( "#settings-invite" ).click(function() {
        window.open(site_url+"guest.html", "_self");
    });
// ===========================profile======================
    $( "#profile-button" ).click(function() {
        var name = $("#profile-name").val();
        var phone = $("#profile-phone").val();
        var position = $("#profile-position").val();
        var department = $("#profile-department").val();
        var company = $("#profile-company").val();
        // if(name == ""){
        //     alert("Enter name");
        //     $("#profile-name").focus();
        // }else if(phone == ""){
        //     alert("Enter phone number");
        //     $("#profile-phone").focus();
        // }else if(position == ""){
        //     alert("Enter position");
        //     $("#profile-position").focus();
        // }else if(department == ""){
        //     alert("Enter department");
        //     $("#profile-department").focus();
        // }else if(company == ""){
        //     alert("Enter company name");
        //     $("#profile-company").focus();
        // }else{
        //     alert("successful");
        //     //window.open(site_url+"enabled.html", "_self");
        // }
        window.open(site_url+"enabled.html", "_self");
    });
// ===========================Guest======================
    $( "#guest-button" ).click(function() {
        var building = $("#guest-building").val();
        var zone = $("#guest-zone").val();
        var time = $("#guest-time").val();
        // if(building == ""){
        //     alert("Enter building");
        //     $("#guest-building").focus();
        // }else if(zone == ""){
        //     alert("Enter zones");
        //     $("#guest-zone").focus();
        // }else if(time == ""){
        //     alert("Enter time");
        //     $("#guest-time").focus();
        // }else{
        //     alert("successful");
        //     //window.open(site_url+"enabled.html", "_self");
        // }
        window.open(site_url+"enabled.html", "_self");
    });
});

// includeHTML("menutop");
// function includeHTML(id) {
//     var elmnt, file, xhttp;
//     elmnt = document.getElementById(id);
//     if(elmnt == null)
//         return;
//     file = elmnt.getAttribute("w3-include-html");
//     if (file) {
//         xhttp = new XMLHttpRequest();
//         xhttp.onreadystatechange = function() {
//             if (this.readyState == 4) {
//                 if (this.status == 200) {elmnt.innerHTML = this.responseText;}
//                 if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
//                 elmnt.removeAttribute("w3-include-html");
//             }
//         }
//     }      
//     xhttp.open("GET", file, true);
//     xhttp.send();
// }