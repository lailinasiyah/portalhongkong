<?php

function sendCorsHeaders(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
    ];

    $isAllowedOrigin = in_array($origin, $allowedOrigins, true)
        || preg_match('#^http://localhost:30\d{2}$#', $origin)
        || preg_match('#^http://127\.0\.0\.1:30\d{2}$#', $origin)
        || preg_match('#^http://192\.168\.\d+\.\d+:30\d{2}$#', $origin);

    if ($isAllowedOrigin) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require 'vendor/autoload.php';


session_start();

// // ===== GLOBAL CORS (WAJIB PALING ATAS) =====
//     Flight::before('start', function () {
//     header("Access-Control-Allow-Origin: http://localhost:3000");
//     header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
//     header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
//     header("Access-Control-Allow-Credentials: true");
//     header("Content-Type: application/json; charset=UTF-8");

//     if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//         http_response_code(200);
//         exit;
//     }
// });

// // ==========================================

// =====================
// CORS CONFIG

Flight::before('start', function () {
    sendCorsHeaders();
    header("Content-Type: application/json; charset=UTF-8");
});




// =====================



/**
 * start config db
 */
$configPath = __DIR__ . '/config.json';
if (!file_exists($configPath)) {
    die('Config file not found');
}
$config = json_decode(file_get_contents($configPath), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die('Invalid JSON config');
}
Flight::set('config', $config);
// REGISTER PDO
Flight::register('db', 'PDO', [
    "mysql:host={$config['db']['host']};dbname={$config['db']['database']};charset=utf8mb4",
    $config['db']['username'],
    $config['db']['password'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
]);
$pdo = Flight::db();
/**
 * end config db
 */

/**
 * start config flight
 */
require 'helper/file.php';
require 'helper/auth.php';
Flight::set('storage_path', __DIR__ . '/storage');
Flight::set('document_types', [
    'cv',
    'certificate',
    'video',
    'photo',
    'passport'
]);
Flight::set('roles', [
    'admin' => [
        ['method' => '*',    'path' => '/document*'],
        ['method' => '*',    'path' => '/applicant*'],
        ['method' => '*',    'path' => '/reserved*'],
        ['method' => '*',    'path' => '/member*'],
        ['method' => '*',    'path' => '/auth/logout'],
    ],

    'user' => [
        ['method' => 'GET',  'path' => '/document'],
        ['method' => 'GET',  'path' => '/document/*'],
        ['method' => 'PATCH', 'path' => '/applicant/*/keterangan'],
        ['method' => 'POST', 'path' => '/auth/logout'],
    ],
]);

/**
 * end config flight
 */

/**
 * start / and test route
 */

Flight::route('/', function () {
    Flight::json([
        'hello' => 'world'
    ]);
});

Flight::route('/json', function () {
    Flight::json([
        'hello' => 'world'
    ]);
});
/**
 * end / and test route
 */

/**
 * start route main module
 */
require 'function/authentication.php';
require 'function/applicant.php';
require 'function/reserved.php';
require 'function/document.php';
require 'function/dashboard.php';
require 'function/refcategory.php';
/**
 * end route main module
 */
// Flight::before('start', function () {
//     $publicRoutes = [
//         '/',
//         '/auth/login',
//     ];

//     $basePath = '/hongkongrekrutment-filemanager';
//     $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

//     if (str_starts_with($path, $basePath)) {
//         $path = substr($path, strlen($basePath));
//     }

//     if (in_array($path, $publicRoutes)) {
//         return;
//     }

//     authorizeRoute();
// });



Flight::start();
