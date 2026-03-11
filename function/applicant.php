<?php

Flight::group('/applicant', function () use ($pdo) {

    /**
     * =========================
     * GET LIST (filter, sort, pagination)
     * =========================
     * GET /applicant?name=&category_id=&sex=&page=&limit=&sort=&order=
     */
    Flight::route('GET /', function () use ($pdo) {
        

        $query  = [];
        $params = [];

        // 🔍 FILTER
        if ($name = Flight::request()->query['name'] ?? null) {
            $query[] = 'name LIKE :name';
            $params[':name'] = "%$name%";
        }

        if ($categoryId = Flight::request()->query['category_id'] ?? null) {
            $query[] = 'category_id = :category_id';
            $params[':category_id'] = $categoryId;
        }

        if ($sex = Flight::request()->query['sex'] ?? null) {
            $query[] = 'sex = :sex';
            $params[':sex'] = $sex;
        }

        $where = $query ? 'WHERE ' . implode(' AND ', $query) : '';

        // 🔃 SORTING
        $allowedSort = ['id','name','category_id','created_at'];
        $sort  = Flight::request()->query['sort'] ?? 'id';
        $order = strtoupper(Flight::request()->query['order'] ?? 'DESC');

        if (!in_array($sort, $allowedSort)) {
            $sort = 'id';
        }

        $order = $order === 'ASC' ? 'ASC' : 'DESC';

        // 📄 PAGINATION
        $page  = max(1, (int)(Flight::request()->query['page'] ?? 1));
        $limit = max(1, min(100, (int)(Flight::request()->query['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        // 🔢 TOTAL
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM applicant $where");
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();

        // 📦 DATA
        $sql = "SELECT a.*, r.name as category_name
                FROM applicant a
                LEFT JOIN ref_category r ON a.category_id = r.id
                $where 
                ORDER BY $sort $order 
                LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }

        // setelah mendapatkan data maka akan ditambhakan detail
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("
                SELECT type, file_path
                FROM document
                WHERE applicant_id = :applicant_id
            ");
            $stmt->bindValue(':applicant_id', $value['id'], PDO::PARAM_INT);
            $stmt->execute();

            $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // default object (biar key selalu ada)
            $document = [
                'photo' => [
                    'typedoc'   => 'photo',
                    'available' => false,
                    'file_path' => null
                ],
                'passport' => [
                    'typedoc'   => 'passport',
                    'available' => false,
                    'file_path' => null
                ],
                'cv' => [
                    'typedoc'   => 'cv',
                    'available' => false,
                    'file_path' => null
                ],
                'video' => [
                    'typedoc'   => 'video',
                    'available' => false,
                    'file_path' => null
                ],
                'certificate' => [
                    'typedoc'   => 'certificate',
                    'available' => false,
                    'file_path' => null
                ],
            ];

            // isi data jika ada di DB
            foreach ($docs as $doc) {
                if (isset($document[$doc['type']])) {
                    $document[$doc['type']]['available'] = true;
                    $document[$doc['type']]['file_path'] = $doc['file_path'];
                }
            }

            $data[$key]['document'] = $document;
        }




        Flight::json([
            'data' => $data,
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total
            ]
        ]);
    });

    /**
     * =========================
     * GET ONE
     * =========================
     * GET /applicant/:id
     */
    Flight::route('GET /@id', function ($id) use ($pdo) {
        

        $stmt = $pdo->prepare("SELECT * FROM applicant WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch();

        if (!$data) {
            Flight::halt(404, 'Applicant not found');
        }

        Flight::json($data);
    });

    /**
     * =========================
     * CREATE
     * =========================
     * POST /applicant
     */
    Flight::route('POST /', function () use ($pdo) {
        
        $body = Flight::request()->data;

        $stmt = $pdo->prepare("
            INSERT INTO applicant 
            (name, category_id, birth_date, sex, weight, height, marital_status, last_education, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
                $body->name,
                $body->category_id,
                $body->birth_date ?? null,
                $body->sex ?? null,
                    isset($body->weight) ? (int)$body->weight : null,
                    isset($body->height) ? (int)$body->height : null,
                    $body->marital_status ?? null,
                    $body->last_education ?? null,
                $body->created_by ?? null
        ]);

        Flight::json([
            'message' => 'Applicant created',
            'id' => $pdo->lastInsertId()
        ], 201);
    });

    /**
     * =========================
     * UPDATE
     * =========================
     * PUT /applicant/:id
     */
    Flight::route('PUT /@id', function ($id) use ($pdo) {
        
        $body = Flight::request()->data;

        $stmt = $pdo->prepare("
            UPDATE applicant SET
                name = ?,
                category_id = ?,
                birth_date = ?,
                sex = ?,
                weight = ?,
                height = ?,
                marital_status = ?,
                last_education = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $body->name,
            $body->category_id,
            $body->birth_date ?? null,
            $body->sex ?? null,
            isset($body->weight) ? (int)$body->weight : null,
            isset($body->height) ? (int)$body->height : null,
            $body->marital_status ?? null,
            $body->last_education ?? null,
            $id
        ]);

        if ($stmt->rowCount() === 0) {
            Flight::halt(404, 'Applicant not found');
        }

        Flight::json(['message' => 'Applicant updated']);
    });

    /**
     * =========================
     * DELETE
     * =========================
     * DELETE /applicant/:id
     */
    Flight::route('DELETE /@id', function ($id) use ($pdo) {
        

        $stmt = $pdo->prepare("DELETE FROM applicant WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            Flight::halt(404, 'Applicant not found');
        }

        Flight::json(['message' => 'Applicant deleted']);
    });

});
