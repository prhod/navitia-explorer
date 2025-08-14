function places_onLoad() {

    t=extractUrlParams();
    document.getElementById("q").value=(t["q"])?t["q"]:"";
    if (t["administrative_region"]=="on"){document.getElementById("administrative_region").checked="true";}
    if (t["stop_area"]=="on"){document.getElementById("stop_area").checked="true";}
    if (t["address"]=="on"){document.getElementById("address").checked="true";}
    if (t["poi"]=="on"){document.getElementById("poi").checked="true";}
    if (t["stop_point"]=="on"){document.getElementById("stop_point").checked="true";}

    document.getElementById("distance_reference").value=(t["distance_reference"])?t["distance_reference"]:"";
    if (document.getElementById("q").value != "") {
        doSearch();
    }
    map = L.map('map').setView([51.505, -0.09], 13);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('click', onMapClick);
    L.control.scale().addTo(map);

    if (t["distance_reference"]){
        var myIcon = L.icon({
            iconUrl: 'img/Here.gif'
        });
        ref_marker = L.marker([t["distance_reference"].split(";")[1], t["distance_reference"].split(";")[0]], {icon: myIcon}).addTo(map);
        lamb=WGS_ED50(t["distance_reference"].split(";")[1], t["distance_reference"].split(";")[0]);
        ref_marker.bindPopup("<b>point de référence pour le calcul de distance</b>"+
            "<br />LatLon wgs84: "+t["distance_reference"].split(";")[0] + " , " + t["distance_reference"].split(";")[1]+
            "<br />LatLon l2E: "+lamb[0] + ", "+ lamb[1]
        );
        map.addLayer(ref_marker);
    }

}

function onMapClick(e) {
    lamb=WGS_ED50(e.latlng.lng, e.latlng.lat);
    popup
        .setLatLng(e.latlng)
        .setContent(
            "LatLon WGS84 : " + e.latlng.lat + ", "+e.latlng.lng+"<br>"+
            "LatLon L2E : " + lamb[0] + ", "+lamb[1]+"<br>" +
            "<a href='javascript:void(0)' onClick='javascript:document.getElementById(\"distance_reference\").value=\""+e.latlng.lng + ";"+e.latlng.lat+"\";document.forms[0].submit();'>Distance depuis ce point</a><br>"
         )
        .openOn(map);
}

function setPermalink() {
    const config = currentUrl.searchParams.get("config");
    currentUrl.search = "";
    currentUrl.searchParams.set("config", config);
    currentUrl.searchParams.set("q", document.getElementById('q').value);
    for (var elem of ["stop_area", 'administrative_region', 'poi', 'address', 'stop_point']) {
        if (document.getElementById(elem).checked) {
            currentUrl.searchParams.set(elem, 'on');
        }
    }
    document.getElementById('permalink').setAttribute("href", currentUrl.toString());
}

function doSearch(){
    setPermalink();
    navitia_call = `coverage/${coverage}/places?q=${document.getElementById('q').value}`;

    for (var elem of ["stop_area", 'administrative_region', 'poi', 'address', 'stop_point']) {
        if (document.getElementById(elem).checked) {
            navitia_call+= `&type[]=${elem}`;
        }
    }

    playground_url = "https://playground.navitia.io/play.html?request=" +
        `https://${currentConf["NavitiaURL"]}/v1/${navitia_call}`

    document.getElementById("title_playground_link").setAttribute("href", playground_url);
    callNavitiaJS_v2(currentConf, navitia_call, showPlaces);
}

function showPlaces(response){
    reference_point=document.getElementById("distance_reference").value.split(";");
    placesBounds=false;
    if (places) {
        for(var p of places){
            this.map.removeLayer(p.marker);
        }
    }

    if (response){
        places=response.places;
        var str="<table border='1'>";
        str+= "<tr>"
        str+= "<th>Type</th>"
        str+= "<th>Name</th>"
        str+= "<th>Lines</th>"
        str+= "<th>Dist. Vol</th>"
        str+= "<th>Dist. Man</th>"
        str+= "<th>Dist. filaire</th>"
        str+= "</tr>"
        for (var i in response.places) {

            str+= "<tr>"
            var place = response.places[i];
            str+= "<td>"+place.embedded_type+"</td>";
            switch (place.embedded_type) {
                case "administrative_region" :
                    str+= "<td>" + place.name + "</td>";
                    break;
                case "stop_area" :
                    str+= `<td><a href='${getPTRefLink(currentConf["Name"], place.embedded_type, place.id)}'>` + place.name + "</a></td>";
                    console.log(place.stop_area)
                    str+=`<td>`;
                    for (l of place.stop_area.lines) {
                        str+=`<span class='icon-ligne' style='margin: 1px; background-color: #${l.color};'>${l.code}</span>`;
                    }
                    str+=`</td>`;
                    break;
                case "address" :
                    str+= "<td>" + place.name + " ("+ place.id + ")" + "</td>";
                    break;
                default:
                    str+= `<td><a href='ptref.html?&ws_name=${ws_name}` +
                        `&coverage=${coverage}&uri=/pois/${place.id}/'>` + place.name + "</a></td>";
            }
            coord=eval("place."+place.embedded_type+".coord");
            str+= "<td>"+distance_wgs84(reference_point[1], reference_point[0], coord.lat, coord.lon)+"</td>" ;
            str+= "</tr>";
            place.marker = L.marker([coord.lat, coord.lon]).addTo(map);
            lamb=WGS_ED50(coord.lon, coord.lat);
            proxy_link = "<a href='places_nearby.html?ws_name="+ws_name+"&coverage="+coverage;
            proxy_link += "&point_id="+place.id+"&point_name="+place.name+"'>nearby</a>";
            place.marker.bindPopup("<b>"+place.name+"</b>"+
                "<br />Id: "+place.id+
                "<br />Quality: "+place.quality+
                "<br />Type: "+place.embedded_type+
                "<br />LatLon wgs84: "+coord.lat + ", "+ coord.lon+
                "<br />LatLon l2E: "+lamb[0] + ", "+ lamb[1]+
                "<br />LatLon l2E: "+lamb[0] + ", "+ lamb[1] +
                "<br />"+proxy_link
            );
            map.addLayer(place.marker);
            if (i==0) { map.setView([coord.lat, coord.lon]);}
            if (!placesBounds) {
                placesBounds=[[coord.lat, coord.lon], [coord.lat, coord.lon]];
            } else {
                if (coord.lat < placesBounds[0][0]) {placesBounds[0][0]=coord.lat};
                if (coord.lat > placesBounds[1][0]) {placesBounds[1][0]=coord.lat};
                if (coord.lon < placesBounds[0][1]) {placesBounds[0][1]=coord.lon};
                if (coord.lon > placesBounds[1][1]) {placesBounds[1][1]=coord.lon};
            }

        }
        str+="</table>";
    }
    document.getElementById('places').innerHTML = str;
    if (placesBounds) {map.fitBounds(placesBounds)};
}

const currentUrl = new URL(document.location);
const currentConf = getConfigByName(currentUrl.searchParams.get('config'));

const ws_name = currentConf["NavitiaURL"];
const coverage = currentConf["Coverage"];

var map;
var places = false;
var placesBounds=false;
var popup = L.popup();

