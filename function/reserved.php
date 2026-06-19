<?php

Flight::group('/reserved', function () use ($pdo) {

    Flight::route('GET /@applicantId', function ($applicantId) use ($pdo) {
        $candidateStmt = $pdo->prepare("
            SELECT id, name, reserved
            FROM applicant
            WHERE id = ?
        ");
        $candidateStmt->execute([$applicantId]);
        $candidate = $candidateStmt->fetch(PDO::FETCH_ASSOC);

        if (!$candidate) {
            Flight::halt(404, 'Applicant not found');
        }

        $stmt = $pdo->prepare("
            SELECT *
            FROM applicant_reserved
            WHERE applicant_id = ?
        ");
        $stmt->execute([$applicantId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        Flight::json([
            'candidate' => $candidate,
            'data' => $data
        ]);
    });

    Flight::route('PUT /@applicantId', function ($applicantId) use ($pdo) {
        $body = Flight::request()->data;

        $candidateStmt = $pdo->prepare("SELECT id FROM applicant WHERE id = ?");
        $candidateStmt->execute([$applicantId]);

        if (!$candidateStmt->fetch(PDO::FETCH_ASSOC)) {
            Flight::halt(404, 'Applicant not found');
        }

        $stmt = $pdo->prepare("
            INSERT INTO applicant_reserved (
                applicant_id,
                status_reserved,
                reserved_date,
                job_order_number,
                job_order_date,
                job_position,
                required_count,
                company_name,
                work_location,
                hongkong_agency_name,
                interview_date,
                estimated_contract_date,
                reserved_notes,
                created_at,
                updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
                status_reserved = VALUES(status_reserved),
                reserved_date = VALUES(reserved_date),
                job_order_number = VALUES(job_order_number),
                job_order_date = VALUES(job_order_date),
                job_position = VALUES(job_position),
                required_count = VALUES(required_count),
                company_name = VALUES(company_name),
                work_location = VALUES(work_location),
                hongkong_agency_name = VALUES(hongkong_agency_name),
                interview_date = VALUES(interview_date),
                estimated_contract_date = VALUES(estimated_contract_date),
                reserved_notes = VALUES(reserved_notes),
                updated_at = NOW()
        ");

        $stmt->execute([
            $applicantId,
            $body->status_reserved ?? 'Reserved',
            $body->reserved_date ?? null,
            $body->job_order_number ?? null,
            $body->job_order_date ?? null,
            $body->job_position ?? null,
            isset($body->required_count) ? (int)$body->required_count : null,
            $body->company_name ?? null,
            $body->work_location ?? null,
            $body->hongkong_agency_name ?? null,
            $body->interview_date ?? null,
            $body->estimated_contract_date ?? null,
            $body->reserved_notes ?? null
        ]);

        Flight::json(['message' => 'Reserved detail saved']);
    });
});
