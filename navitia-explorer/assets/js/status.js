function getStatus(){
    navitia_call = `coverage/${coverage}/status`;
    callNavitiaJS_v2(currentConf, navitia_call, show_status);
}

function show_status(response){
    const localData = [];
    for (const [k, v] of Object.entries(response.status)) {
        localData.push({
            key: k,
            value: v
        });
    }
    configDT = new DataTable('#status', {
        columns: [
            { title: 'key' , data: 'key' },
            { title: 'value' , data: 'value' },
        ],
        pageLength: 20,
        data: localData
    });

    const localData2 = [];
    const info_additions = {
        "night_bus_filter_base_factor" : `heure d’arrivée maximal pour la recherche = “heure d’arrivée du BEST” + night_bus_filter_base_factor + “durée de l’itinéraire BEST” x night_bus_filter_max_factor`,
        "night_bus_filter_max_factor" : `heure d’arrivée maximal pour la recherche = “heure d’arrivée du BEST” + night_bus_filter_base_factor + “durée de l’itinéraire BEST” x night_bus_filter_max_factor`
    };
    for (const [k, v] of Object.entries(response.status.parameters)) {
        localData2.push({
            key: k,
            value: v,
            info: info_additions[k] || ""
        });
    }
    status_paramsDT = new DataTable('#status_params', {
        columns: [
            { title: 'key' , render: function (data, typr, row) {
                if (row["info"] !== "" ) {

                    return `${row["key"]} <span><i class="fa fa-info-circle" aria-hidden="true"></i></span>`;
                } else {
                    return `${row["key"]}`;
                }
            } },
            { title: 'value' , data: 'value' },
        ],
        pageLength: 20,
        data: localData2
    });
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
var statusDT;
var status_paramsDT;

getStatus();