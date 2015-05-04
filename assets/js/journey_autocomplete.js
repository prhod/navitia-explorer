$(document).ready(function(){

/* Départ*/
    $( "#from_text" ).autocomplete({
        source: function( request, response) {
            $.ajax({
                url: "./navitia.php" + '?ws_name=' + document.getElementById("ws_name").value +"&ress=coverage/" + 
                    document.getElementById("coverage").value+"/places?type[]=stop_area",
                dataType: "json",
                data: {
                q: request.term
                },
                success: function( data ) {
                    ListData = [];
                    for (var i = 0; i < data['places'].length; i++) {
                        //ListData.push(data['places'][i]['name'])
                        ListData.push({"id": data['places'][i]['id'], "value": data['places'][i]['name']})
                    }
                    response(ListData);
                }
            });
        },
        minLength: 3,
        select: function(event, ui){
            document.getElementById("from").value = ui.item.id;
        }
   });
   
/* Arrivée */
   $( "#to_text" ).autocomplete({
		source: function( request, response) {
            $.ajax({
                url: "./navitia.php" + '?ws_name=' + document.getElementById("ws_name").value +"&ress=coverage/" + 
                    document.getElementById("coverage").value+"/places?type[]=stop_area",
                dataType: "json",
                data: {
                q: request.term
                },
               success: function( data ) {
                   ListData = [];
                   for (var i = 0; i < data['places'].length; i++) {
                      //ListData.push(data['places'][i]['name'])
                      ListData.push({"id": data['places'][i]['id'], "value": data['places'][i]['name']})
                      }
                   //console.log(ListData)
                   response(ListData);
               }
            });
		},
        minLength: 3,
		select: function(event, ui){
			document.getElementById("to").value = ui.item.id;
		}
	});
});

