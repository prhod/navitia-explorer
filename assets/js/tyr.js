
function print_tyr_job_list(response){
	selected_region=""
	var now = new Date();
	str="<table border='1px' >";
	str+="<tr><th>id</th><th>instance</th><th>created_at</th><th>updated_at</th><th>state</th><th>data_sets</th><th>params</th></tr>";
	for (var i in response.jobs){
		job=response.jobs[i];
		if ((job.state == "pending") && (job.data_sets.length == 0) ) {continue;}
		//var myDate = r.end_production_date?IsoToJsDate(r.end_production_date):now;
		//alert(myDate);
		str+="<tr>";
		str+="<td>" + job.id+"</td>";
		str+="<td>" + job.instance.name+"</td>";
		d = new Date(job.created_at);
		d = new Date(d.getTime() + 3600*1000);
		str+="<td>" + formatDate(d, "yyyy-mm-dd") + "<br>" + formatDate(d, "hh:nn:ss") + "</td>";
		if (job.updated_at) {
			d = new Date(job.updated_at);
			d = new Date(d.getTime() + 3600*1000);
		} else d="null";
		str+="<td>" + formatDate(d, "yyyy-mm-dd") + "<br>" + formatDate(d, "hh:nn:ss") + "</td>";
		str+="<td>" + job.state+"</td>";
		if (job.data_sets.length > 0) {
			str+="<td>";
			for (ds in job.data_sets) {
				str += job.data_sets[ds].type + " - " + job.data_sets[ds].name + "<br>";
			}
			str+="</td>";
		} else {
			str+="<td>&nbsp;</td>";
		}
		str_properties="";
		for (p in job.instance) {
			if (p !="id" && p!= "name")
				str_properties += p + ":" + job.instance[p]+"<br>";
		}
		str+="<td>" + str_properties+"</td>";
/*
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
*/
		str+="</tr>";
	}
	str+="</table>"
	document.getElementById('div_tyr_job_list').innerHTML=str;
}


function tyr_onLoad() {
	menu.show_menu("menu_div");

	t=extractUrlParams();
    //ne fonctionne pas avec Tyr.
	callTyrJS(t["ws_name"], "jobs/"+t["coverage"], print_tyr_job_list);
}


