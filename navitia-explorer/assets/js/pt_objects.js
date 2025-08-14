function ptobjects_onLoad() {

    t=extractUrlParams();
    document.getElementById("q").value=(t["q"])?t["q"]:"";

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
    document.getElementById('permalink').setAttribute("href", currentUrl.toString());
}

function doSearch(){
    setPermalink();
    navitia_call = `coverage/${coverage}/pt_objects?q=${document.getElementById('q').value}`;


    playground_url = "https://playground.navitia.io/play.html?request=" +
        `https://${currentConf["NavitiaURL"]}/v1/${navitia_call}`

    document.getElementById("title_playground_link").setAttribute("href", playground_url);
    callNavitiaJS_v2(currentConf, navitia_call, showPTObjects);
}

function showPTObjects(response){
    placesBounds=false;
    if (places) {
        for(var p of places){
            this.map.removeLayer(p.marker);
        }
    }

    if (response){
        var str="<table border='1'>";
        str+= "<tr>"
        str+= "<th>Type</th>"
        str+= "<th>Name</th>"
        str+= "</tr>"
        for (var item of response.pt_objects) {

            str+= "<tr>"
            str+= "<td>"+item.embedded_type+"</td>";
            switch (item.embedded_type) {
                case "route" :
                    str+= "<td>" + item.name + "</td>";
                    break;
                case "line" :
                    str+=`<td>`;
                        str+=`<a href="${getPTRefLink(currentConf["Name"], item.embedded_type, item.id)}"><span class='icon-ligne' style='margin: 1px; background-color: #${item.line.color};'>${item.line.code}</span></a>${item.line.name}`;
                    str+=`</td>`;
                    break;
                default:
                    str+= `<td>TODO</td>`;
            }
            str+= "</tr>";

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

