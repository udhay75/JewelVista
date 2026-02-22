
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// --- CONFIGURATION ---
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
    $projects = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $projects[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'originalImage' => $row['original_image'],
            'results' => json_decode($row['results_json']),
            'createdAt' => (int)$row['created_at']
        ];
    }
    echo json_encode($projects);
} catch (\PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
