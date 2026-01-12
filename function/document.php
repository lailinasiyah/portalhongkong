<?php

Flight::group('/document', function () {

    /**
     * ==================================================
     * GET LIST
     * GET /document?applicant_id=&type=&page=&limit=&sort=&order=
     * ==================================================
     */
    Flight::route('GET /', function () {
        $pdo = Flight::db();

        $where = [];
        $params = [];

        if ($applicantId = Flight::request()->query['applicant_id'] ?? null) {
            $where[] = 'd.applicant_id = :applicant_id';
            $params[':applicant_id'] = $applicantId;
        }

        if ($type = Flight::request()->query['type'] ?? null) {
            $where[] = 'd.type = :type';
            $params[':type'] = $type;
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $allowedSort = ['id', 'applicant_id', 'type', 'created_at'];
        $sort = Flight::request()->query['sort'] ?? 'id';
        $order = strtoupper(Flight::request()->query['order'] ?? 'DESC');

        if (!in_array($sort, $allowedSort)) {
            $sort = 'id';
        }

        $order = $order === 'ASC' ? 'ASC' : 'DESC';

        $page = max(1, (int)(Flight::request()->query['page'] ?? 1));
        $limit = max(1, min(100, (int)(Flight::request()->query['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        $count = $pdo->prepare("SELECT COUNT(*) FROM document d $whereSql");
        $count->execute($params);
        $total = (int)$count->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT d.*
            FROM document d
            $whereSql
            ORDER BY $sort $order
            LIMIT :limit OFFSET :offset
        ");

        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

        $stmt->execute();

        Flight::json([
            'data' => $stmt->fetchAll(),
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total
            ]
        ]);
    });

    /**
     * ==================================================
     * GET ONE
     * GET /document/:id
     * ==================================================
     */
    Flight::route('GET /@id', function ($id) {
        $pdo = Flight::db();

        $stmt = $pdo->prepare("SELECT * FROM document WHERE id = ?");
        $stmt->execute([$id]);

        $data = $stmt->fetch();

        if (!$data) {
            Flight::halt(404, 'Document not found');
        }

        Flight::json($data);
    });

    /**
     * ==================================================
     * CREATE (UPLOAD + TRANSACTION)
     * POST /document
     * ==================================================
     * 
     */
    Flight::route('POST /', function () {
    $pdo = Flight::db();
    $req = Flight::request();

    $pdo->beginTransaction();

    try {
        if (!isset($_FILES['file'])) {
            Flight::halt(400, 'File is required');
        }

        $applicantId = $req->data->applicant_id ?? null;
        $type        = $req->data->type ?? null;

        if (!$applicantId || !$type) {
            Flight::halt(400, 'applicant_id and type are required');
        }

        $allowedTypes = Flight::get('document_types');

        if (!in_array($type, $allowedTypes, true)) {
            Flight::halt(400, 'Invalid document type');
        }

        // 🔒 VALIDASI APPLICANT
        $check = $pdo->prepare("SELECT id FROM applicant WHERE id = ?");
        $check->execute([$applicantId]);
        if (!$check->fetch()) {
            Flight::halt(400, 'Invalid applicant_id');
        }

        // 🔍 CEK DOCUMENT EXISTING
        $stmt = $pdo->prepare("
            SELECT id, file_path 
            FROM document 
            WHERE applicant_id = ? AND type = ?
            LIMIT 1
        ");
        $stmt->execute([$applicantId, $type]);
        $existing = $stmt->fetch();

        // 📁 PREPARE STORAGE
        $storage = Flight::get('storage_path');
        $dir = "$storage/$applicantId/$type";
        ensureDir($dir);

        $filename = uniqid() . '_' . basename($_FILES['file']['name']);
        $newPath  = "$dir/$filename";

        if (!move_uploaded_file($_FILES['file']['tmp_name'], $newPath)) {
            throw new Exception('File upload failed');
        }

        $relativePath = str_replace($storage, '', $newPath);

        // 🔁 REPLACE OR INSERT
        if ($existing) {
            // 🧹 DELETE FILE LAMA
            deleteFile($storage . $existing['file_path']);

            $update = $pdo->prepare("
                UPDATE document 
                SET file_path = ?, created_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $update->execute([$relativePath, $existing['id']]);

            $docId = $existing['id'];
            $message = 'Document replaced';

        } else {
            $insert = $pdo->prepare("
                INSERT INTO document (applicant_id, type, file_path)
                VALUES (?, ?, ?)
            ");
            $insert->execute([$applicantId, $type, $relativePath]);

            $docId = $pdo->lastInsertId();
            $message = 'Document created';
        }

        $pdo->commit();

        Flight::json([
            'message' => $message,
            'id' => $docId
        ], 201);

    } catch (Throwable $e) {
        $pdo->rollBack();

        if (isset($newPath)) {
            deleteFile($newPath);
        }

        Flight::halt(500, $e->getMessage());
    }
});


    /**
     * ==================================================
     * UPDATE (REPLACE FILE)
     * PUT /document/:id
     * ==================================================
     */
    Flight::route('PUT /@id', function ($id) {
        $pdo = Flight::db();
        $req = Flight::request();

        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("SELECT * FROM document WHERE id = ?");
            $stmt->execute([$id]);
            $old = $stmt->fetch();

            if (!$old) {
                Flight::halt(404, 'Document not found');
            }

            $applicantId = $req->data->applicant_id ?? $old['applicant_id'];
            $type = $req->data->type ?? $old['type'];
            $filePath = $old['file_path'];

            if (isset($req->data->type)) {
                $allowedTypes = Flight::get('document_types');

                if (!in_array($req->data->type, $allowedTypes, true)) {
                    Flight::halt(400, 'Invalid document type');
                }
            }


            if (isset($_FILES['file'])) {
                $storage = Flight::get('storage_path');
                $dir = "$storage/$applicantId/$type";
                ensureDir($dir);

                $filename = uniqid() . '_' . basename($_FILES['file']['name']);
                $newPath = "$dir/$filename";

                if (!move_uploaded_file($_FILES['file']['tmp_name'], $newPath)) {
                    throw new Exception('File upload failed');
                }

                deleteFile($storage . $filePath);
                $filePath = str_replace($storage, '', $newPath);
            }

            $stmt = $pdo->prepare("
                UPDATE document SET
                    applicant_id = ?,
                    type = ?,
                    file_path = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $applicantId,
                $type,
                $filePath,
                $id
            ]);

            $pdo->commit();
            Flight::json(['message' => 'Document updated']);

        } catch (Throwable $e) {
            $pdo->rollBack();
            Flight::halt(500, $e->getMessage());
        }
    });

    /**
     * ==================================================
     * DELETE (DELETE FILE)
     * DELETE /document/:id
     * ==================================================
     */
    Flight::route('DELETE /@id', function ($id) {
        $pdo = Flight::db();

        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("SELECT file_path FROM document WHERE id = ?");
            $stmt->execute([$id]);
            $doc = $stmt->fetch();

            if (!$doc) {
                Flight::halt(404, 'Document not found');
            }

            $pdo->prepare("DELETE FROM document WHERE id = ?")->execute([$id]);

            deleteFile(Flight::get('storage_path') . $doc['file_path']);

            $pdo->commit();
            Flight::json(['message' => 'Document deleted']);

        } catch (Throwable $e) {
            $pdo->rollBack();
            Flight::halt(500, $e->getMessage());
        }
    });

});
