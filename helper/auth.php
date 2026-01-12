<?php

function requireAuth() {
    if (!isset($_SESSION['auth'])) {
        Flight::halt(401, 'Unauthorized');
    }
}

function authorizeRoute()
{
    requireAuth();

    $role   = $_SESSION['auth']['role'] ?? null;
    $rules  = Flight::get('roles');
    $method = $_SERVER['REQUEST_METHOD'];

    // 🔥 NORMALIZE PATH (SAMA DENGAN index.php)
    $basePath = '/rekrutment-filemanager';
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    if (str_starts_with($path, $basePath)) {
        $path = substr($path, strlen($basePath));
    }

    if (!$role || !isset($rules[$role])) {
        Flight::halt(403, 'Role not allowed');
    }

    foreach ($rules[$role] as $rule) {
        if ($rule['method'] !== '*' && $rule['method'] !== $method) {
            continue;
        }

        if (fnmatch($rule['path'], $path)) {
            return; // ✅ ALLOWED
        }
    }

    Flight::halt(403, 'Access denied');
}
