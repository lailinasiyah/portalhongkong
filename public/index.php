<?php

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/config.php';

use app\middleware\AuthMiddleware;

session_start();

/**
 * GLOBAL AUTH MIDDLEWARE
 */
Flight::before('start', function () {

    $publicRoutes = [
        'GET:/',
        'POST:/auth/login'
    ];

    $method = $_SERVER['REQUEST_METHOD'];
    $uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    $basePath = dirname($_SERVER['SCRIPT_NAME']);
    $path = str_replace($basePath, '', $uri);
    $path = '/' . trim($path, '/');

    $routeKey = $method . ':' . $path;

    if (!in_array($routeKey, $publicRoutes)) {
        AuthMiddleware::handle();
    }
});

/**
 * LOAD CONTROLLERS
 */
require __DIR__ . '/../app/controllers/AuthController.php';
require __DIR__ . '/../app/controllers/DashboardController.php';
require __DIR__ . '/../app/controllers/ApplicantController.php';
require __DIR__ . '/../app/controllers/DocumentController.php';

/**
 * ROOT (PUBLIC)
 */
Flight::route('GET /', function () {
    Flight::json([
        'status' => true,
        'message' => 'FlightPHP OK',
        'session' => $_SESSION['user'] ?? null
    ]);
});

Flight::start();
