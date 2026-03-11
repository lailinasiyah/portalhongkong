<?php

Flight::group('/dashboard', function () {
    // Flight::route('GET /', function () {
    //     $pdo = Flight::db();

    //     $stmt = $pdo->prepare("SELECT
    //     c.id,
    //     c.name,
    //     count(c.id) as count_cat
    //     FROM ref_category c
    //     JOIN applicant a ON a.category_id = c.id
    //     GROUP BY c.id");
    //     $stmt->execute();
    //     $applicantCount = $stmt->fetchAll();


    //     Flight::json([
    //         'message' => 'Dashboard',
    //         'data' => $applicantCount
    //     ]); 
    // });

    //upadate api dashboard 2026-03-11

    Flight::route('GET /', function () {
        $pdo = Flight::db();

        $stmt = $pdo->prepare("
        SELECT
            c.id,
            c.name,
            SUM(CASE WHEN a.sex = 'F' THEN 1 ELSE 0 END) AS female,
            SUM(CASE WHEN a.sex = 'M' THEN 1 ELSE 0 END) AS male
        FROM ref_category c
        LEFT JOIN applicant a ON a.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY c.id
        ");

        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Flight::json([
            'message' => 'Dashboard',
            'data' => $result
        ]);
    });

});