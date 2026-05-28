<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

// DB connection parameters (same as api.php)
$host = '100.112.150.56';
$db   = 'portfolio';
$user = 'sa';
$pass = 'Abcd1234@';
$port = '1433';
$dsn = "dblib:host=$host:$port;dbname=$db";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    $stmt = $pdo->query('SELECT id, title, summary, content, image_url, created_at FROM blogs ORDER BY id DESC');
    $blogs = [];
    while ($row = $stmt->fetch()) {
        // Safe date parsing and formatting
        if (isset($row['created_at']) && !empty($row['created_at'])) {
            try {
                $dateObj = new DateTime($row['created_at']);
                $row['date'] = $dateObj->format('F d, Y');
            } catch (Exception $e) {
                $row['date'] = date('F d, Y');
            }
        } else {
            $row['date'] = date('F d, Y');
        }
        // Remove raw timestamp
        unset($row['created_at']);
        $blogs[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $blogs]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
}
?>
