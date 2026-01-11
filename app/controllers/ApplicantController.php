<?php
// app/controllers/ApplicantController.php

/**
 * GET /applicant
 * Ambil semua applicant
 */
Flight::route('GET /applicant', function () {

    $db = Flight::db();
    $stmt = $db->query("SELECT * FROM applicant ORDER BY id DESC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Flight::json([
        'status' => true,
        'data' => $data
    ]);
});


/**
 * GET /applicant/@id
 * Ambil detail applicant
 */
Flight::route('GET /applicant/@id', function ($id) {

    $db = Flight::db();
    $stmt = $db->prepare("SELECT * FROM applicant WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        Flight::json([
            'status' => false,
            'message' => 'Applicant tidak ditemukan'
        ], 404);
        return;
    }

    Flight::json([
        'status' => true,
        'data' => $data
    ]);
});


/**
 * POST /applicant
 * Tambah applicant
 */
Flight::route('POST /applicant', function () {

    session_start();

    $request = Flight::request()->data;

    if (!$request->name || !$request->category_id) {
        Flight::json([
            'status' => false,
            'message' => 'name dan category_id wajib diisi'
        ], 400);
        return;
    }

    $db = Flight::db();
    $stmt = $db->prepare("
        INSERT INTO applicant
        (name, category_id, birth_date, sex, created_by)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $request->name,
        $request->category_id,
        $request->birth_date ?? null,
        $request->sex ?? null,
        $_SESSION['user']['id'] ?? null
    ]);

    Flight::json([
        'status' => true,
        'message' => 'Applicant berhasil ditambahkan'
    ]);
});


/**
 * PUT /applicant/@id
 * Update applicant
 */
Flight::route('PUT /applicant/@id', function ($id) {

    session_start();
    parse_str(Flight::request()->getBody(), $data);

    $db = Flight::db();
    $stmt = $db->prepare("
        UPDATE applicant SET
            name = ?,
            category_id = ?,
            birth_date = ?,
            sex = ?,
            updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $data['name'] ?? null,
        $data['category_id'] ?? null,
        $data['birth_date'] ?? null,
        $data['sex'] ?? null,
        $id
    ]);

    if ($stmt->rowCount() === 0) {
        Flight::json([
            'status' => false,
            'message' => 'Applicant tidak ditemukan'
        ], 404);
        return;
    }

    Flight::json([
        'status' => true,
        'message' => 'Applicant berhasil diupdate'
    ]);
});


/**
 * DELETE /applicant/@id
 * Hapus applicant
 */
Flight::route('DELETE /applicant/@id', function ($id) {

    $db = Flight::db();
    $stmt = $db->prepare("DELETE FROM applicant WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        Flight::json([
            'status' => false,
            'message' => 'Applicant tidak ditemukan'
        ], 404);
        return;
    }

    Flight::json([
        'status' => true,
        'message' => 'Applicant berhasil dihapus'
    ]);
});
