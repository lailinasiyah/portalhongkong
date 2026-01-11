<?php
// app/config.php

// ============================
// ERROR REPORTING (DEV)
// ============================
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ============================
// TIMEZONE
// ============================
date_default_timezone_set('Asia/Jakarta');

// ============================
// DATABASE CONFIG
// ============================
Flight::register('db', 'PDO', [
    'mysql:host=localhost;dbname=sdm_db;charset=utf8mb4',
    'root',
    ''
], function ($db) {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
});

// ============================
// JSON RESPONSE DEFAULT
// ============================
Flight::map('json', function ($data, $code = 200) {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode($data);
    exit;
});
