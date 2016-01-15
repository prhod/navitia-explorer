function sort_compare_coverage(cov1, cov2){
	country1 = cov1.id.split('-')[0];
	country2 = cov2.id.split('-')[0];
	if (country1.length != country2.length) {
		//on trie les pays les plus grands en premiers (clients specifiques type transilien)
		return country2.length - country1.length;
	} else {
		//meme taille de pays, on met fr en 1er
		country1 = country1.substring(0, 2);
		country2 = country2.substring(0, 2);
		if (country1 == country2) {
			//on trie par ordre alpha
			return cov1.id.localeCompare(cov2.id);
		}
		if (country1 == "fr") {  return -1;  }
		if (country2 == "fr") {  return 1;  }
	}
	//on trie par ordre alpha
	return cov1.id.localeCompare(cov2.id);
}

function print_coveragelist_status(cov_list){
	selected_region=""
	var now = new Date();
	str="<table border='1px'>";
	str+="<tr><th></th><th>Region</th><th>Status</th><th>Production Start</th><th>Production End</th><th>Publication Date</th><th>Last Load</th></tr>";
	for (var i in cov_list){
		r=cov_list[i];
		var myDate = r.end_production_date?IsoToJsDate(r.end_production_date):now;
		//alert(myDate);
		str+="<tr>";
		str+="<td><input type='radio' name='selectedregion' id='selectedregion' onclick='focusRegion(\""+r.id+"\")'></td>";
		str+="<td>" + r.region_id+"</td>";
		str+="<td>" + r.status+"</td>";
		str+="<td>" + r.start_production_date+"</td>";
		str+="<td>";
		dstr=r.end_production_date + " (" + dateDiff(myDate,now)+")"
		if (dateDiff(myDate,now) > 21) {
			str+="<span style=''>" + dstr+"</span>";
		} else  {
			if (dateDiff(myDate,now) > 7) {
				str+="<span style='color:#666600;'>" + dstr+"</span>";
			} else {
				str+="<span style='color:red;'>" + dstr+"</span>";
			}
		}
		str+="</td>";
        str+="<td>" + NavitiaDateTimeToString(r.publication_date, 'yyyymmdd hh:nn') +"</td>";
        str+="<td>" + NavitiaDateTimeToString(r.last_load_at, 'yyyymmdd hh:nn') +"</td>";
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
                    shape = coverages2[c2].shape;
                    break;
                }
            }
            coverages[c1].shape = shape;
        }
		show_coveragelist_on_map();
	});
}
    
function coverage_onLoad() {
	menu.show_menu("menu_div");
	t=extractUrlParams();
	ws_name = (t["ws_name"])?t["ws_name"]:"";
	coverage = (t["coverage"])?t["coverage"]:"";
	callNavitiaJS(ws_name, 'status', '', function(response){
		coverages = response.regions;
        for (c1 in coverages){
            coverages[c1].id = coverages[c1].region_id; //harmonisation des identifiants entre /status et /coverage
        }
		coverages.sort(sort_compare_coverage);
		print_coveragelist_status(coverages);
	});
}
        

function focusRegion(region_id){
	showOnMap(region_id);
	for (var i in coverage.regions){
		r=coverage.regions[i];
		if (r.shape && r.id==region_id) {
			map.setCenter(geojsonToGmap(r.shape)[0]);
		}
	}
}	

function show_coveragelist_on_map(region_id){
	for (var i in map_polygons){map.removeLayer(map_polygons[i]);}
	map_polygons=[];
	selectedBounds = false;
	globalBounds = false;
	for (var i in coverages){
		//if (i != 6) continue;
		r=coverages[i];
		if (r.shape) {
			geoJson=wkt2geojson(r.shape);
			if (geoJson.type == "Linestring") {
				geoJson_coords=geoJson.coordinates;
			} else {
				geoJson_coords=geoJson.coordinates[0];
			};
			if (!globalBounds)
				globalBounds = L.latLngBounds(
					[geoJson_coords[0][1], geoJson_coords[0][0] ],
					[geoJson_coords[1][1], geoJson_coords[1][0] ]);
				for (p in geoJson_coords) {
					globalBounds.extend(L.latLng(geoJson_coords[p][1], geoJson_coords[p][0]));
				}
			if (r.id!=region_id) {
				map_poly = L.geoJson([geoJson],{
					color: '#FF0000',
					opacity: 1.0,
					weight: 3,
					fillColor: '#FF0000',
					fillOpacity: 0.35
				});
			} else {
				map_poly = L.geoJson([geoJson],{
					color: '#0000FF',
					opacity: 1.0,
					weight: 3,
					fillColor: '#0000FF',
					fillOpacity: 0.35
				});
				selectedBounds = L.latLngBounds(
					[geoJson_coords[0][1], geoJson_coords[0][0] ],
					[geoJson_coords[1][1], geoJson_coords[1][0] ]);
				for (p in geoJson_coords) {
					selectedBounds.extend(L.latLng(geoJson_coords[p][1], geoJson_coords[p][0]));
				}
			}
			map_polygons.push(map_poly);
			map_poly.addTo(map);
		}
	}
	if (selectedBounds) {
		map.fitBounds(selectedBounds)
	} else if (globalBounds) {
		map.fitBounds(globalBounds)
	};
}

var selected = null;
var infowindow = null;
var map = L.map('map').setView([51.505, -0.09], 13);
var coverages = null;
var map_polygons = [];
// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
