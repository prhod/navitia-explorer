function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("LatLon : " + e.latlng.lat + ", "+e.latlng.lng)
        .openOn(map);
}

function init_date(sdate, sheure){
    r_date=""
    d= new Date()
    if (!sdate || sdate==""){
        if (d.getDate()<10) { r_date+= "0"}
        r_date+= d.getDate()+"/";
        if (d.getMonth()<9) { r_date+= "0"}
        r_date+= (d.getMonth()+1)+"/";
        r_date+= d.getFullYear()
    } else {r_date=sdate;}
    document.getElementById("date").value=r_date;

    r_heure=""
    if (!sheure || sheure==""){
        h=d.getHours();
        m=d.getMinutes();
        r_heure+= (h<10)?"0"+h:h;
        r_heure+= "h";
        r_heure+= (m<10)?"0"+m:m;
        //r_heure+= "00";
    } else {r_heure=sheure;}
    document.getElementById("heure").value=r_heure;
}



function getLineSelect(){
    if (t["network_id"]) {
        first_id = "";
        selected_exists = false;
        navitia_call = `coverage/${t["coverage"]}/networks/${t["network_id"]}/lines/?count=1000`
        callNavitiaJS_v2(currentConf, navitia_call,
            function(response){
                var str="<select name='line_id' id='line_id' onchange='document.forms[0].submit()'>"
                for (var n in response.lines) {
                    var line = response.lines[n];
                    if (first_id == "") {first_id = line.id;}
                    selected = "";
                    if ((t["line_id"]) && (t["line_id"]==line.id)) {
                        selected_exists = true;
                        selected = " selected ";
                    }
                    str+= "<option " + selected+ " value='"+line.id+"'>" + line.code + ' - ' + line.name + "</option>";
                }
                str+="</select>";
                document.getElementById("line_div").innerHTML=str;
                if ( (!t["line_id"]) || (!selected_exists) ){
                    //si aucune ligne selectionné : on prend la 1ere et on relance la selection de la route
                    t["line_id"] = first_id;
                }
                getRouteSelect();
            }
        );
    }
}

function getRouteSelect(){
    if (t["line_id"]) {
        first_id = ""
        selected_exists = false;
        navitia_call = `coverage/${t["coverage"]}/networks/${t["network_id"]}/lines/${t["line_id"]}/routes/?count=1000`
        callNavitiaJS_v2(currentConf, navitia_call,
            function(response){
                var str="<select name='route_id' id='route_id' onchange='document.forms[0].submit()'>"
                for (var n in response.routes) {
                    var route = response.routes[n];
                    if (first_id == "") {first_id = route.id;}
                    selected = "";
                    if ((t["route_id"]) && (t["route_id"]==route.id)) {
                        selected_exists = true;
                        selected = " selected ";
                    }
                    str+= "<option " + selected+ " value='"+route.id+"'>" + route.name + "</option>";
                }
                str+="</select>";
                document.getElementById("route_div").innerHTML=str;
                if ( (!t["route_id"]) || (!selected_exists) ){
                    //si aucun parcours selectionné : on prend le 1er et on relance l'affichage de la grille
                    t["route_id"] = first_id;
                }
                getRouteSchedule();
            }
        );
    }
}

function getRouteSchedule(){
    date_time = natural_str_to_iso(
        document.getElementById("date").value,
        document.getElementById("heure").value);
    const isoString =  (new Date().toISOString().split('.')[0] + 'Z').replaceAll("-", "").replaceAll(":", "");
    navitia_call = `coverage/${coverage}/routes/${route_id}/route_schedules/?from_datetime=${isoString}`;
    playground_url = "https://playground.navitia.io/play.html?request=" +
        `https://${currentConf["NavitiaURL"]}/v1/${navitia_call}`

    document.getElementById("title_playground_link").setAttribute("href", playground_url);
    callNavitiaJS_v2(currentConf, navitia_call, function(response){
        if (response.route_schedules) {
            schedule = response.route_schedules[0]; //1 seule grille sur un parcours
            show_schedule_html();
        }
    });
}

function show_schedule_html(){
    str="<table border='1px' style='font-size:10px;>";
    str+="<thead>";
    str+="<tr><td>&nbsp;</td>";
    for (var i in schedule.table.headers){
        item=schedule.table.headers[i];
        for (var li in item.links){
            link=item.links[li];
            if (link.type=="vehicle_journey") {
                item.vehicle_journey_id=link.id;
            }
        }
        str+="<td>";
        //str+=item.vehicle_journey_id+"<br>";
        //str+=item.display_informations.direction+"<br>";
        str+="</td>";
    }
    str+="</tr>"
    str+="</thead>";
    str+="<tbody  style='display: block; border: 1px solid green; height: 500px; overflow: scroll;'>";
    for (var i in schedule.table.rows){
        row=schedule.table.rows[i];
        str+="<tr>";
        str+="<td>"+row.stop_point.label.replace(/ /g, "&nbsp;")+"</td>";
        for (var j in row.date_times){
            dt=row.date_times[j];
            if (dt.date_time) {
                var myDate = IsoToJsDate(dt.date_time);
                str+="<td>"+formatDate(myDate, "hh:nn:ss")+"</td>";
            } else {
                str+="<td>&nbsp;</td>"
            }
        }
        str+="</tr>"
    }
    str+="</tbody>";
    str+="</table>";
    document.getElementById("route_schedules_div").innerHTML=str;
}

function route_schedule_onLoad(){
    t=extractUrlParams();

    init_date();

    if (t["date"]) { document.getElementById("date").value=decodeURIComponent(t["date"]);}
    if (t["heure"]) { document.getElementById("heure").value=decodeURIComponent(t["heure"]);}

    getRouteSchedule();
}

const currentUrl = new URL(document.location);
const config_name = currentUrl.searchParams.get('config');
var currentConf = getConfigByName(config_name);
ws_name = currentConf["NavitiaURL"];
coverage = currentConf["Coverage"];

var route_id = currentUrl.searchParams.get('route_id');

var selected = null;
var t;
var schedule;

