<?php

$xml = file_get_contents("https://www.enteract.io/api/v1/accounts/get_csrf_token/");
print_r($xml);
?>