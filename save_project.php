
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- CONFIGURATION ---
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERR_MODE            => PDO::ERR_MODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($input) {
    $stmt = $pdo->prepare("REPLACE INTO projects (id, name, original_image, results_json, created_at) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['id'],
        $input['name'],
        $input['originalImage'],
        json_encode($input['results']),
        $input['createdAt']
    ]);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'no data']);
}
?>
