<?php

Flight::group('/ref', function () use ($pdo) {


    Flight::route('GET /category', function () use ($pdo) {
        

        $query  = [];
        $params = [];

        // 🔍 FILTER
        if ($name = Flight::request()->query['name'] ?? null) {
            $query[] = 'name LIKE :name';
            $params[':name'] = "%$name%";
        }

        $where = $query ? 'WHERE ' . implode(' AND ', $query) : '';

        // 🔃 SORTING
        $allowedSort = ['id','name','created_at'];
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
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM ref_category $where");
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();

        // 📦 DATA
        $sql = "SELECT * FROM ref_category 
                $where 
                ORDER BY $sort $order 
                LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
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
                'total' => (int)$total
            ]
        ]);
    });

    
});
