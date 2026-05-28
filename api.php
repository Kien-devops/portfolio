<?php
header("Content-Type: application/json");
http_response_code(410); // Gone
echo json_encode([
    "status" => "error",
    "message" => "The generic api.php endpoint is deprecated. Use /projects.php for projects and /blogs.php for blogs."
]);
?>
