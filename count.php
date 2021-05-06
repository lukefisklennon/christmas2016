<?php

$file = fopen("presents", "r");
$presents = fread($file, filesize("presents"));
fclose($file);
$presents = $presents + (int)$_GET["add"];
$file = fopen("presents", "w");
fwrite($file, $presents);
fclose($file);

echo $presents;

?>