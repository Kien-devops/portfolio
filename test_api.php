<?php
/**
 * Test script to verify the Portfolio Projects API.
 * This can be run from the command line: php test_api.php
 */

$url = 'http://localhost:3001/api.php?action=projects';

echo "Testing Projects API URL: {$url}\n";
echo "--------------------------------------------------\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo "[-] Connection Failed!\n";
    echo "[-] Error: {$error}\n";
} else {
    echo "[+] HTTP Status Code: {$httpCode}\n";
    echo "[+] Response Length: " . strlen($response) . " bytes\n";
    
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "[-] Invalid JSON returned!\n";
        echo "[-] Raw Response:\n{$response}\n";
    } else {
        echo "[+] JSON format is valid.\n";
        echo "[+] Status: " . ($data['status'] ?? 'unknown') . "\n";
        if (isset($data['data']) && is_array($data['data'])) {
            echo "[+] Found " . count($data['data']) . " projects.\n\n";
            foreach ($data['data'] as $idx => $project) {
                echo "--- Project " . ($idx + 1) . " ---\n";
                echo "ID: " . ($project['id'] ?? 'N/A') . "\n";
                echo "Number: " . ($project['project_number'] ?? 'N/A') . "\n";
                echo "Title: " . ($project['title'] ?? 'N/A') . "\n";
                echo "GitHub: " . ($project['github_url'] ?? 'N/A') . "\n";
                echo "Tech Stack: " . implode(', ', $project['tech_stack'] ?? []) . "\n";
                echo "Details Count: " . (isset($project['details']) ? count($project['details']) : 0) . "\n\n";
            }
        } else {
            echo "[-] No project data array found in response.\n";
        }
    }
}
