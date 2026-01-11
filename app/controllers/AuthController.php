<?php

// LOGIN
Flight::route('POST /auth/login', function () {

    // ❌ JANGAN session_start() di sini

    $request  = Flight::request();
    $username = $request->data->username ?? null;
    $password = $request->data->password ?? null;
    

    if (!$username || !$password) {
        Flight::json([
            'status' => false,
            'message' => 'Username dan password wajib diisi'
        ], 400);
        return;
    }

    $db = Flight::db();
    $stmt = $db->prepare("SELECT * FROM member WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        Flight::json([
            'status' => false,
            'message' => 'User tidak ditemukan'
        ], 401);
        return;
    }
    // echo password_hash('admin123', PASSWORD_BCRYPT);
    // die(var_dump(password_verify('admin123', $user['password'])));

    if (!password_verify($password, $user['password'])) {
        Flight::json([
            'status' => false,
            'message' => 'Password salah'
        ], 401);
        return;
    }

    // simpan session
    $_SESSION['user'] = [
        'id'       => $user['id'],
        'username' => $user['username']
    ];

    Flight::json([
        'status'  => true,
        'message' => 'Login berhasil',
        'data'    => $_SESSION['user']
    ]);
});


// LOGOUT
Flight::route('POST /auth/logout', function () {

    // ❌ JANGAN session_start() di sini
    session_destroy();

    Flight::json([
        'status'  => true,
        'message' => 'Logout berhasil'
    ]);
});
