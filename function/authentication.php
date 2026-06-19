<?php

/**
 * =========================
 * AUTH ROUTE GROUP
 * =========================
 */
Flight::group('/auth', function () {

    /**
     * =========================
     * CURRENT USER
     * GET /auth/me
     * =========================
     */
    Flight::route('GET /me', function () {
        if (!isset($_SESSION['auth'])) {
            Flight::halt(401, 'Not logged in');
        }

        Flight::json([
            'user' => [
                'id' => $_SESSION['auth']['id'],
                'username' => $_SESSION['auth']['username'],
                'role' => $_SESSION['auth']['role']
            ]
        ]);
    });

    /**
     * =========================
     * LOGIN
     * POST /auth/login
     * =========================
     * {
     *   "username": "admin",
     *   "password": "admin123"
     * }
     */
    Flight::route('POST /login', function () {
        $pdo = Flight::db();
        $req = Flight::request();

        $username = $req->data->username ?? null;
        $password = $req->data->password ?? null;

        if (!$username || !$password) {
            Flight::halt(400, 'Username and password required');
        }

        $stmt = $pdo->prepare("
            SELECT id, username, password, role 
            FROM member 
            WHERE username = ?
            LIMIT 1
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            Flight::halt(401, 'Invalid username or password');
        }

        // 🔐 SET SESSION
        $_SESSION['auth'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ];


        Flight::json([
            'message' => 'Login success',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    });

    /**
     * =========================
     * LOGOUT
     * POST /auth/logout
     * =========================
     */
    Flight::route('POST /logout', function () {

        if (!isset($_SESSION['auth'])) {
            Flight::halt(401, 'Not logged in');
        }

        session_unset();
        session_destroy();

        Flight::json([
            'message' => 'Logout success'
        ]);
    });

});
