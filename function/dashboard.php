<?php

Flight::group('/dashboard', function () {
    Flight::route('GET /', function () {
        $pdo = Flight::db();

        $stmt = $pdo->prepare("SELECT
        c.id,
        c.name,
        count(c.id) as count_cat
        FROM ref_category c
        JOIN applicant a ON a.category_id = c.id
        GROUP BY c.id");
        $stmt->execute();
        $applicantCount = $stmt->fetchAll();


        Flight::json([
            'message' => 'Dashboard',
            'data' => $applicantCount
        ]); 
    });
});