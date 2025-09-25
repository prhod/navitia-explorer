function page_onLoad() {

    ws_name = currentConf["NavitiaURL"];
    coverage = currentConf["Coverage"];

    var call_type = currentUrl.searchParams.get("call_type");
    if (call_type === undefined || call_type === null) {call_type = "disruptions"}

    navitia_call = `coverage/${coverage}/${call_type}?count=1000`;
    playground_url = "https://playground.navitia.io/play.html?request=" +
        `https://${currentConf["NavitiaURL"]}/v1/${navitia_call}`

    document.getElementById("title_playground_link").setAttribute("href", playground_url);

    const newUrl = new URL(document.location);
    newUrl.searchParams.set('call_type', "line_reports");
    document.getElementById(`subsection-line_reports`).setAttribute("href", newUrl.toString());
    newUrl.searchParams.set('call_type', "traffic_reports");
    document.getElementById(`subsection-traffic_reports`).setAttribute("href", newUrl.toString());
    newUrl.searchParams.set('call_type', "disruptions");
    document.getElementById(`subsection-disruptions`).setAttribute("href", newUrl.toString());
    newUrl.searchParams.set('call_type', "equipment_reports");
    document.getElementById(`subsection-equipment_reports`).setAttribute("href", newUrl.toString());

    callNavitiaJS_v2(currentConf, navitia_call, function(response){
        if ("line_reports" in response) {
            showLineReportsInTable(response);
        } else {
            showdisruptionsInTable(response.disruptions);
        }
    });

}

function displayLineReportDetails(d) {
    // `d` is the original data object for the row
    return (
        '<dl>' +
        '<dt>Full name:</dt>' +
        '<dd>' +
        d.name +
        '</dd>' +
        '<dt>Extension number:</dt>' +
        '<dd>' +
        d.extn +
        '</dd>' +
        '<dt>Extra info:</dt>' +
        '<dd>And any further details here (images etc)...</dd>' +
        '</dl>'
    );
}

function showLineReportsInTable(navitia_response){
    const disruptionsDT = new DataTable('#disruptionsDT', {
        order: [],
        columns: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: ''
            },
            { title: 'Line', render: function  (data, type, row) {
                return `<a href="${getPTRefLink(currentConf["Name"], "line", row.line.id)}"><span title="${row.line.name}" class='icon-ligne' style='margin: 1px; background-color: #${row.line.color};'>${row.line.code}</span></a>`;
            }}
        ],
        data: navitia_response.line_reports
    });
    disruptionsDT.on('click', 'tbody td.dt-control', function (e) {
        let tr = e.target.closest('tr');
        let row = disruptionsDT.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
        }
        else {
            // Open this row
            row.child(displayLineReportDetails(row.data())).show();
        }
    });
}

function showEquipmentReportsInTable(navitia_response){
    data = [];
    for (let er of navitia_response.equipment_reports) {
        for (let sae of er.stop_area_equipments) {
            data.push({
                line : er.line,
                stop_area : sae.stop_area,
                equipment_details : sae.equipment_details
            })
        }
    }
    const disruptionsDT = new DataTable('#disruptionsDT', {
        order: [],
        columns: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: ''
            },
            { title: 'Line', render: function  (data, type, row) {
                return `<a href="${getPTRefLink(currentConf["Name"], "line", row.line.id)}"><span title="${row.line.name}" class='icon-ligne' style='margin: 1px; background-color: #${row.line.color};'>${row.line.code}</span></a>`;
            }},
            { title: 'StopArea', render: function  (data, type, row) {
                return `<a href="${getPTRefLink(currentConf["Name"], "line", row.line.id)}">${row.stop_area.name}</a>`;
            }}
        ],
        data: navitia_response.line_reports
    });
    disruptionsDT.on('click', 'tbody td.dt-control', function (e) {
        let tr = e.target.closest('tr');
        let row = disruptionsDT.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
        }
        else {
            // Open this row
            row.child(displayLineReportDetails(row.data())).show();
        }
    });
}

function showdisruptionsInTable(disruptions){
    const disruptionsDT = new DataTable('#disruptionsDT', {
        order: [],
        columns: [
            { title: 'ID', data: 'id' },
            { title: 'Cause' , data: 'cause' },
            // { title: 'Contributor' , data: 'contributor' },
            { title: 'Severity', render: function  (data, type, row) {
                result = `<span title="effect: ${row.severity.effect}" style="background-color: #${row.severity.color};">${row.severity.name}</span>`
                return result;
            } },
            { title: 'Impacts', render: function  (data, type, row) {
                if (row.id == "034b4a40-5dff-11f0-9380-0a58a9feac02") {
                    console.log(row);
                }
                if ( ! row.impacted_objects ) { return "" };
                result = "";
                for (io of row.impacted_objects) {
                    item = io.pt_object;
                    if (item.embedded_type == 'line') {
                        result += `<a href="${getPTRefLink(currentConf["Name"], item.embedded_type, item.id)}"><span title="${item.line.name}" class='icon-ligne' style='margin: 1px; background-color: #${item.line.color};'>${item.line.code}</span></a>`;
                    } else {
                        result += `<a href="${getPTRefLink(currentConf["Name"], item.embedded_type, item.id)}">${item.name}</a>`;
                    }

                }
                return result;
            } },
            { title: 'Status' , data: 'status' },
            { title: 'From', render: function  (data, type, row) {
                if (row.application_periods) {
                    return row.application_periods[0].begin;
                } else {
                    return "";
                }
            } },
            { title: 'Until', render: function  (data, type, row) {
                if (row.application_periods) {
                    return row.application_periods[0].end;
                } else {
                    return "";
                }
            } },
            { title: 'Updated at' , data: 'updated_at' },
            // { title: 'Links', render: function  (data, type, row) {
            //     // playground_url = "https://playground.navitia.io/play.html?request=" +
            //     //     `https://${currentConf["NavitiaURL"]}/v1/coverage/${currentConf["Coverage"]}/pois/${row["id"]}`
            //     // result = `<a href="${playground_url}" target="_blank"><img src="assets/img/navitia.png" width="20" height="20" /></a>`;
            //     // return result;
            // } },
        ],
        data: disruptions
    });
}

function setPermalink() {
    const config = currentUrl.searchParams.get("config");
    currentUrl.search = "";
    currentUrl.searchParams.set("config", config);
    currentUrl.searchParams.set("q", document.getElementById('q').value);
    document.getElementById('permalink').setAttribute("href", currentUrl.toString());
}

function showDisruptions(response){
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
var disruptions = false;

