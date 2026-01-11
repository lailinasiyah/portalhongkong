<?php
// app/controllers/DashboardController.php

Flight::route('GET /dashboard', function () {

    $db = Flight::db();

    // total applicant
    $applicant = $db->query("SELECT COUNT(*) AS total FROM applicant")
                    ->fetch(PDO::FETCH_ASSOC);

    // total document
    $document = $db->query("SELECT COUNT(*) AS total FROM document")
                   ->fetch(PDO::FETCH_ASSOC);

    // grouping document per type
    $docByType = $db->query("
        SELECT type, COUNT(*) AS total
        FROM document
        GROUP BY type
    ")->fetchAll(PDO::FETCH_ASSOC);

    Flight::json([
        'status' => true,
        'data' => [
            'total_applicant' => (int)$applicant['total'],
            'total_document'  => (int)$document['total'],
            'document_by_type' => $docByType
        ]
    ]);
});
