<?php
// app/controllers/DocumentController.php

/**
 * GET /document
 * Ambil semua dokumen
 */
Flight::route('GET /document', function () {

    $db = Flight::db();
    $stmt = $db->query("SELECT * FROM document ORDER BY id DESC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Flight::json([
        'status' => true,
        'data' => $data
    ]);
});


/**
 * GET /document/@id
 * Ambil semua dokumen milik applicant
 */
Flight::route('GET /document/@id', function ($id) {

    $db = Flight::db();
    $stmt = $db->prepare("
        SELECT * FROM document
        WHERE applicant_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$id]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Flight::json([
        'status' => true,
        'data' => $data
    ]);
});


/**
 * GET /document/@id/@type
 * Ambil dokumen applicant berdasarkan type
 */
Flight::route('GET /document/@id/@type', function ($id, $type) {

    $db = Flight::db();
    $stmt = $db->prepare("
        SELECT * FROM document
        WHERE applicant_id = ? AND type = ?
    ");
    $stmt->execute([$id, $type]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Flight::json([
        'status' => true,
        'data' => $data
    ]);
});


/**
 * POST /document/@id
 * Upload dokumen applicant
 * form-data:
 * - file
 * - type
 */
Flight::route('POST /document/@id', function ($id) {

    session_start();

    if (!isset($_FILES['file']) || !isset($_POST['type'])) {
        Flight::json([
            'status' => false,
            'message' => 'File dan type wajib diisi'
        ], 400);
        return;
    }

    $type = $_POST['type'];
    $file = $_FILES['file'];

    // folder penyimpanan
    $uploadDir = __DIR__ . '/../../storage/documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // nama file aman
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = $id . '_' . $type . '_' . time() . '.' . $ext;
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        Flight::json([
            'status' => false,
            'message' => 'Upload file gagal'
        ], 500);
        return;
    }

    // simpan ke database
    $db = Flight::db();
    $stmt = $db->prepare("
        INSERT INTO document
        (applicant_id, type, file_path, created_by)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
        $id,
        $type,
        'storage/documents/' . $fileName,
        $_SESSION['user']['id'] ?? null
    ]);

    Flight::json([
        'status' => true,
        'message' => 'Dokumen berhasil diupload'
    ]);
});


/**
 * DELETE /document/file/@doc_id
 * Hapus dokumen
 */
Flight::route('DELETE /document/file/@doc_id', function ($doc_id) {

    $db = Flight::db();

    // ambil data file
    $stmt = $db->prepare("SELECT * FROM document WHERE id = ?");
    $stmt->execute([$doc_id]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$doc) {
        Flight::json([
            'status' => false,
            'message' => 'Dokumen tidak ditemukan'
        ], 404);
        return;
    }

    // hapus file fisik
    $filePath = __DIR__ . '/../../' . $doc['file_path'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    // hapus dari DB
    $stmt = $db->prepare("DELETE FROM document WHERE id = ?");
    $stmt->execute([$doc_id]);

    Flight::json([
        'status' => true,
        'message' => 'Dokumen berhasil dihapus'
    ]);
});
