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

    $stmt = $pdo->query('SELECT 
        p.id, p.project_number, p.title, p.summary, p.github_url, p.tech_stack,
        pd.id as detail_id, pd.icon, pd.detail_title, pd.detail_description 
        FROM projects p 
        LEFT JOIN project_details pd ON p.id = pd.project_id 
        ORDER BY p.id ASC, pd.id ASC');

    $projects = [];
    while ($row = $stmt->fetch()) {
        $projectId = $row['id'];
        if (!isset($projects[$projectId])) {
            $techStack = $row['tech_stack'] ?? '';
            $projects[$projectId] = [
                "id" => $projectId,
                "project_number" => $row['project_number'] ?? '',
                "title" => $row['title'] ?? '',
                "summary" => $row['summary'] ?? '',
                "github_url" => $row['github_url'] ?? '#',
                "tech_stack" => array_values(array_filter(array_map('trim', explode(',', (string) $techStack)))),
                "details" => []
            ];
        }
        if (!empty($row['detail_id'])) {
            $projects[$projectId]['details'][] = [
                "icon" => $row['icon'] ?? 'fa-solid fa-circle-info',
                "detail_title" => $row['detail_title'] ?? '',
                "detail_description" => $row['detail_description'] ?? ''
            ];
        }
    }
    $projects = array_values($projects);
    echo json_encode(["status" => "success", "data" => $projects]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
}
?>
