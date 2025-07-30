
function print_coveragelist_status(cov_list){
    selected_region=""
    var now = new Date();
    str="<table border='1px'>";
    str+="<tr><th>Region</th><th>Status</th><th>Production Start</th><th>Production End</th><th>Publication Date</th><th>Last Load</th><th>Maps</th></tr>";
    for (var i in cov_list){
        r=cov_list[i];
        var myDate = r.end_production_date?IsoToJsDate(r.end_production_date):now;
        str+="<tr>";
        ws_name = (t["ws_name"])?t["ws_name"]:"";
        link = "<a href='./ptref.html?ws_name=" + ws_name + "&coverage=" + r.region_id + "'>" + r.region_id + "</a>" + "&nbsp;";
        str+="<td>" + link + "</td>";
        str+="<td>" + r.status+"</td>";
        str+="<td>" + r.start_production_date+"</td>";
        str+="<td>";
        str+="<span style='" + DateToColor(myDate) + "'>" + r.end_production_date + " (" + dateDiff(myDate,now)+")</span>";
        str+="</td>";
        str+="<td>" + NavitiaDateTimeToString(r.publication_date, 'yyyymmdd hh:nn') +"</td>";
        str+="<td align='center'>" + NavitiaDateTimeToString(r.last_load_at, 'yyyymmdd hh:nn') +"</td>";
        span = "<span id='showonmap_" + r.region_id + "' onClick='show_coverage_on_map(\""+r.region_id+"\");' class='span_link' style='display:none;'><img src='./assets/img/map_pin.png' height='20' width='13'></span>";
        str+="<td align='center'>" + span + "</td>";
        str+="</tr>";
    }
    str+="</table>"
    document.getElementById('div_coverage').innerHTML=str;
    get_shapes_and_show_on_map();
}

function get_shapes_and_show_on_map(){
    callNavitiaJS(ws_name, 'coverage', '', function(response){
        coverages2 = response.regions;
        for (c1 in coverages){
            shape = null;
            for (c2 in coverages2){
                if (coverages[c1].region_id == coverages2[c2].id){
                    if (coverages2[c2].shape != "") {
                        shape = coverages2[c2].shape;
                        span_id = "showonmap_" + coverages[c1].region_id;
                        $("#" + span_id).css("display", "inline");
                    }
                    break;
                }
            }
            coverages[c1].shape = shape;
        }
        show_coveragelist_on_map();
    });
}

function editModalConfig(config) {
    console.log(config);
    document.getElementById("confID").value = config["ID"];
    document.getElementById("confName").value = config["Name"];
    document.getElementById("confUrl").value = config["NavitiaURL"];
    document.getElementById("confCoverage").value = config["Coverage"];
    document.getElementById("confToken").value = config["Token"];
    dialog.showModal();
}

function saveModalConfig() {
    configList = JSON.parse(localStorage.getItem('config'));
    if (configList == null) 
        configList = [];
    // console.log("saveModalConfig - before change");
    // console.log(configList);
    var newConfig = {}
    newConfig["ID"] = document.getElementById("confID").value;
    newConfig["Name"] = document.getElementById("confName").value;
    newConfig["NavitiaURL"] = document.getElementById("confUrl").value;
    newConfig["Coverage"] = document.getElementById("confCoverage").value;
    newConfig["Token"] = document.getElementById("confToken").value;
    if (newConfig["ID"] == "") {
        console.log("saveModalConfig - adding config");
        newConfig["ID"] = crypto.randomUUID();
        configList.push(newConfig); 
    } else {
        console.log("saveModalConfig - modifying config");
        // updating configList
        for (var c of configList) {
            if (c["ID"] == newConfig["ID"]) {
                c["Name"] = newConfig["Name"]
                c["NavitiaURL"] = newConfig["NavitiaURL"]
                c["Coverage"] = newConfig["Coverage"]
                c["Token"] = newConfig["Token"]
            }
        }
    }
    console.log(configList);
    localStorage.setItem('config', JSON.stringify(configList));
    configDT.clear();
    configDT.rows.add(configList).draw()
}

function deleteRow(configID) {
    configList = JSON.parse(localStorage.getItem('config'));
    configList = configList.filter(function(el) { return el.ID != configID; });
    localStorage.setItem('config', JSON.stringify(configList));
    configDT.clear();
    configDT.rows.add(configList).draw()
}

function editRow(configID) {
    configList = JSON.parse(localStorage.getItem('config'));
    config = configList.filter(function(el) { return el.ID == configID; });
    editModalConfig(config[0]);
}

var selected = null;
var infowindow = null;

console.log(localStorage.getItem('config'));
localData = JSON.parse(localStorage.getItem('config')) || [];
console.log(localData);

configDT = new DataTable('#config', {
    columns: [
        { title: 'Name', data: 'Name' },
        { title: 'Navitia URL' , data: 'NavitiaURL' },
        { title: 'Coverage', data: 'Coverage' },
        // { title: 'Token' , data: 'Token' },
        { 
            title: "",
            orderable : false,
            width: 80, 
            render : function (data, type, row) {
                id = "'" + row["ID"] + "'";
                btnDelete = '<button class="btn" onClick="deleteRow(' + id + ')"><i class="fa fa-trash"></i></button>';
                btnEdit = '<button class="btn" onClick="editRow(' + id + ')"><i class="fa fa-pencil"></i></button>';
                return btnDelete + btnEdit
            }                
        }
    ],
    data: localData
});   


const addConfigButton = document.getElementById("addConfig");
const cancelButton = document.getElementById("cancel");
const validateConfButton = document.getElementById("validateConf");
const dialog = document.getElementById("favDialog");
dialog.returnValue = "config";

function openCheck(dialog) {
  if (dialog.open) {
    console.log("Dialog open");
  } else {
    console.log("Dialog closed");
  }
}

addConfigButton.addEventListener("click", () => {
  dialog.showModal();
  openCheck(dialog);
});

// Form cancel button closes the dialog box
cancelButton.addEventListener("click", () => {
  dialog.close("animalNotChosen");
  openCheck(dialog);
});
validateConfButton.addEventListener("click", () => {
    saveModalConfig();
});