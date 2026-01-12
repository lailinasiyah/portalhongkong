<?php

Flight::group('/dashboard', function () {
    Flight::route('GET /', function () {
        $pdo = Flight::db();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM applicant");
        $stmt->execute();
        $applicantCount = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM document");
        $stmt->execute();
        $documentCount = $stmt->fetchColumn();

        Flight::json([
            'message' => 'Dashboard',
            'data' => [
                'applicant_count' => $applicantCount,
                'document_count' => $documentCount
            ]
        ]); 
    });
});