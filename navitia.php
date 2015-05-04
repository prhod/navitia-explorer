<?php

function checkURL($text){
    $result=str_replace(" ", "%20", $text);
    return $result;
}

$ws_params = json_decode(file_get_contents("./params.json"), true);

$ws_name=isset($_GET["ws_name"])?$_GET["ws_name"]:"api.navitia.io";
if ($ws_name == "undefined") {
    $ws_name="api.navitia.io";
}

$ress=isset($_GET["ress"])?$_GET["ress"]:"";
$ress=checkURL($ress);
//on ajoute les autres paramètres qui sont séparés par des "&"
foreach ($_GET as $k=>$v) {
    if (($k != "ress") && ($k!="ws_name")) {
        if (is_array($v)){
            foreach($v as $array_item){
                $ress.="&".$k."[]=".checkURL($array_item);
            }
        } else {
            $ress.="&".$k."=".checkURL($v);
        }
    }
}

if (strpos($ress,'tyr')===0) {
    $url=$ws_params["environnements"][$ws_name]["tyr"].explode("/", $ress)[1];
    $key="";
    if ($url=="") {
        //tyr n'est pas disponible sur cet environnement
        header("Content-Type: application/json");
        echo("{\"error\": \"No tyr URL available\"}");
        exit;
    }
} else {
    $url=$ws_params["environnements"][$ws_name]["url"].$ress;
    $key=$ws_params["environnements"][$ws_name]["key"];
}

$header[] = 'Authorization: '.$key;

$curl = curl_init();
curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_COOKIESESSION, true);
$return = curl_exec($curl);


header("Content-Type: application/json");
echo("{");
echo("\"url\": \"".$url."\",\n");
echo("\"key\": \"".$key."\",\n");
echo(substr($return,1));
curl_close($curl);


?>
