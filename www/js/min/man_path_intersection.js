/*! VolunteerRescue | (c) 2012 - 2018 SKRPC Holdings, Inc. 
 * http://volunteerrescue.org/app_license
 */
;var manPI_map=null;var manPI_ptOne;var manPI_ptTwo;var manPI_ptIntersection;var manPI_mkrOne;var manPI_mkrTwo;var manPI_mkrIntersection;var manPI_pathOne;var manPI_pathTwo;var manPI_points=null;$("#manPI_page").on("pageshow",function(){var c;var b;var a;vr_device.googleAnalytics();if(g_onLine==false){$("#manCC_divOffline").css("display","block")}manPI_points=vr_device.localStorage.getItem("manWayPoints");if(!manPI_points){manPI_points=[]}else{manPI_points=JSON.parse(manPI_points)}b=$("#manPI_waypointsOne");a=$("#manPI_waypointsTwo");b.empty().append($('<option value="-1" selected>None</option>')).selectmenu("refresh",true);a.empty().append($('<option value="-1" selected>None</option>')).selectmenu("refresh",true);for(c in manPI_points){b.append($('<option value="'+c+'">'+manPI_points[c].description+"</option>"));a.append($('<option value="'+c+'">'+manPI_points[c].description+"</option>"))}$("img#manPI_online").attr("src",(g_onLine==true?g_basePath+"images/online.png":g_basePath+"images/offline.png"));if(vr_device.geolocation&&vr_device.geolocation.getCurrentPosition){$.mobile.loading("show",{theme:"a",text:"Retrieving current position..."});vr_device.geolocation.getCurrentPosition(function(d){var e;vr_cc.setCompassDesignators(d.coords.latitude,d.coords.longitude);e=vr_cc.formatLatLon(d.coords.latitude,d.coords.longitude);vr_cc.displayCoordinates("#manPI_p1_formatted",e);vr_cc.displayCoordinates("#manPI_p2_formatted",e);manPI_ptOne=new LatLon(d.coords.latitude,d.coords.longitude);manPI_ptTwo=new LatLon(d.coords.latitude,d.coords.longitude);$.mobile.loading("hide");volunteerRescue.messageDialog("Information","<p>The retrieved position is accurate to "+Number(d.coords.accuracy).toFixed(2)+" metres.</p>",null)},function(d){$.mobile.loading("hide");volunteerRescue.messageDialog("Error","<p>Unable to determine current position:"+d.message+"</p>",null)},{enableHighAccuracy:true,maximumAge:30000,timeout:30000})}});$("#manPI_waypointsOne").change(function(){var a=$(this).val();if(a!=-1){manPI_ptOne=new LatLon(manPI_points[a].lat,manPI_points[a].lon);vr_cc.displayCoordinates("#manPI_p1_formatted",vr_cc.formatLatLon(manPI_points[a].lat,manPI_points[a].lon));manPI_calculate()}});$("#manPI_waypointsTwo").change(function(){var a=$(this).val();if(a!=-1){manPI_ptTwo=new LatLon(manPI_points[a].lat,manPI_points[a].lon);vr_cc.displayCoordinates("#manPI_p2_formatted",vr_cc.formatLatLon(manPI_points[a].lat,manPI_points[a].lon));manPI_calculate()}});$("#manPI_p1_coordinates").change(function(){var a=vr_cc.determineLatLon($(this).val());manPI_ptOne=new LatLon(a.lat,a.lon);vr_cc.displayCoordinates("#manPI_p1_formatted",vr_cc.formatLatLon(a.lat,a.lon));manPI_calculate()});$("#manPI_p2_coordinates").change(function(){var a=vr_cc.determineLatLon($(this).val());manPI_ptTwo=new LatLon(a.lat,a.lon);vr_cc.displayCoordinates("#manPI_p2_formatted",vr_cc.formatLatLon(a.lat,a.lon));manPI_calculate()});$('[id^="manPI_edit_"]').change(function(){manPI_calculate()});$("#manPI_btnShowMap").click(function(){$(this).remove();if(manPI_map==null){$("#manPI_mapCanvas").css("display","block");if(typeof google=="undefined"){var a=document.createElement("script");a.type="text/javascript";a.async=true;a.src="https://maps-api-ssl.google.com/maps/api/js?key=AIzaSyBDQfGuTaIZxmRmQ5BCgZdQba8qoWdeUvY&sensor=false&callback=manPI_mapsApiLoaded";document.body.appendChild(a)}else{manPI_mapsApiLoaded()}}else{manPI_mapsApiLoaded()}return false});var manPI_calculate=function(){var b=Geo.parseDMS($("#manPI_edit_p1_bearing").val());var a=Geo.parseDMS($("#manPI_edit_p2_bearing").val());manPI_ptIntersection=LatLon.intersection(manPI_ptOne,b,manPI_ptTwo,a);if(manPI_ptIntersection!=null&&!isNaN(manPI_ptIntersection.lat())){vr_cc.displayCoordinates("#manPI_ptIntersection",vr_cc.formatLatLon(manPI_ptIntersection.lat(),manPI_ptIntersection.lon()));$("#manPI_distPoint1").html(manPI_ptIntersection.distanceTo(manPI_ptOne));$("#manPI_distPoint2").html(manPI_ptIntersection.distanceTo(manPI_ptTwo));if(g_onLine==true&&manPI_map==null){$("#manPI_btnShowMap").css("display","block")}}else{$("#manPI_ptIntersection").html(null);$("#manPI_distPoint1").html(null);$("#manPI_distPoint2").html(null);if(g_onLine==true&&manPI_map==null){$("#manPI_btnShowMap").css("display","none")}}manPI_mapManagePoints()};var manPI_mapsApiLoaded=function(){if(manPI_map==null){manPI_map=new google.maps.Map($("#manPI_mapCanvas")[0],{zoom:10,center:new google.maps.LatLng(0,0),mapTypeId:google.maps.MapTypeId.TERRAIN,panControl:false,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.DROPDOWN_MENU},zoomControlOptions:{style:google.maps.ZoomControlStyle.LARGE},scaleControl:false});manPI_mkrOne=new google.maps.Marker({map:manPI_map,title:"First point"});manPI_mkrTwo=new google.maps.Marker({map:manPI_map,title:"Second point"});manPI_mkrIntersection=new google.maps.Marker({map:manPI_map,title:"Intersection point"});manPI_pathOne=new google.maps.Polyline({map:manPI_map,strokeColor:"#990000",geodesic:true});manPI_pathTwo=new google.maps.Polyline({map:manPI_map,strokeColor:"#990000",geodesic:true})}if(manPI_map!=null&&manPI_ptIntersection!=null){manPI_mapManagePoints()}};var manPI_mapManagePoints=function(){var b=[];var a;if(manPI_map==null){return}if(manPI_ptIntersection!=null){a=new google.maps.LatLngBounds();b[0]=new google.maps.LatLng(manPI_ptOne.lat(),manPI_ptOne.lon());b[1]=new google.maps.LatLng(manPI_ptTwo.lat(),manPI_ptTwo.lon());b[2]=new google.maps.LatLng(manPI_ptIntersection.lat(),manPI_ptIntersection.lon());a.extend(b[0]);a.extend(b[1]);a.extend(b[2]);manPI_mkrOne.setOptions({position:b[0],visible:true});manPI_mkrTwo.setOptions({position:b[1],visible:true});manPI_mkrIntersection.setOptions({position:b[2],visible:true});manPI_pathOne.setOptions({path:[b[0],b[2]],visible:true});manPI_pathTwo.setOptions({path:[b[1],b[2]],visible:true});manPI_map.fitBounds(a)}else{manPI_mkrOne.setVisible(false);manPI_mkrTwo.setVisible(false);manPI_mkrIntersection.setVisible(false);manPI_pathOne.setVisible(false);manPI_pathTwo.setVisible(false)}};