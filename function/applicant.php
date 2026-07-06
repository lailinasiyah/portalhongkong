<?php

Flight::group('/applicant', function () use ($pdo) {
    $cvTemplateName = '!FORMAT CV LPK MSS NEW.xlsx';
    $resolveCvTemplatePath = function () use ($cvTemplateName) {
        $paths = [
            __DIR__ . '/../templates/' . $cvTemplateName,
            __DIR__ . '/../public/templates/' . $cvTemplateName,
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    };

    $normalizeDate = function ($value) {
        $text = trim((string)($value ?? ''));
        if ($text === '') {
            return null;
        }

        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $text, $matches)) {
            return "{$matches[3]}-{$matches[2]}-{$matches[1]}";
        }

        return $text;
    };
    $pdfSafeText = function ($value) {
        $text = trim((string)($value ?? ''));
        $text = preg_replace('/[^\x20-\x7E]/', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    };
    $wrapPdfText = function ($label, $value, $maxLength = 92) {
        $text = trim((string)$label . ': ' . (string)($value ?? '-'));
        if ($text === trim((string)$label) . ':') {
            $text .= ' -';
        }

        $lines = [];
        while (strlen($text) > $maxLength) {
            $break = strrpos(substr($text, 0, $maxLength), ' ');
            $break = $break === false ? $maxLength : $break;
            $lines[] = substr($text, 0, $break);
            $text = ltrim(substr($text, $break));
        }
        $lines[] = $text;
        return $lines;
    };
    $formatSex = function ($value) {
        $text = strtolower(trim((string)($value ?? '')));
        if ($text === 'm' || $text === 'male') return 'Male';
        if ($text === 'f' || $text === 'female') return 'Female';
        return trim((string)($value ?? ''));
    };
    $formatTitleCase = function ($value) {
        $text = strtolower(trim((string)($value ?? '')));
        return $text === '' ? '' : ucwords($text);
    };
    $buildCandidatePdf = function ($candidate) use ($pdfSafeText, $wrapPdfText, $formatSex, $formatTitleCase) {
        $lines = [
            'PT. MITRA SINERGI SUKSES',
            'Candidate CV',
            'Generated from public/templates/templete.docx',
            '',
        ];

        $fields = [
            ['Name', $candidate['name'] ?? ''],
            ['Sex', $formatSex($candidate['sex'] ?? '')],
            ['Birth Date', $candidate['birth_date'] ?? ''],
            ['Age', $candidate['age'] ?? ''],
            ['Religion', $candidate['religion'] ?? ''],
            ['Marital Status', $formatTitleCase($candidate['marital_status'] ?? '')],
            ['Education', $candidate['last_education'] ?? ''],
            ['Address', $candidate['home_address'] ?? ''],
            ['Phone', $candidate['phone'] ?? ''],
            ['Height', isset($candidate['height']) ? $candidate['height'] . ' cm' : ''],
            ['Weight', isset($candidate['weight']) ? $candidate['weight'] . ' kg' : ''],
            ['Husband', $candidate['husband_name'] ?? ''],
            ['Children', $candidate['number_of_children'] ?? ''],
            ['Father', $candidate['father_name'] ?? ''],
            ['Mother', $candidate['mother_name'] ?? ''],
            ['Family Rank', $candidate['family_rank'] ?? ''],
        ];

        foreach ($fields as [$label, $value]) {
            foreach ($wrapPdfText($label, $value) as $line) {
                $lines[] = $line;
            }
        }

        $lines[] = '';
        $lines[] = 'Work Experience';
        $workExperiences = [];
        if (!empty($candidate['work_experience'])) {
            $decoded = json_decode($candidate['work_experience'], true);
            $workExperiences = is_array($decoded) ? $decoded : [];
        }

        foreach ($workExperiences as $index => $experience) {
            $lines[] = 'Experience ' . ($index + 1);
            foreach ($wrapPdfText('Period', ($experience['from'] ?? '-') . ' to ' . ($experience['to'] ?? '-')) as $line) $lines[] = $line;
            foreach ($wrapPdfText('Employer', $experience['employerName'] ?? '') as $line) $lines[] = $line;
            foreach ($wrapPdfText('Address', $experience['address'] ?? '') as $line) $lines[] = $line;
            foreach ($wrapPdfText('Family', ($experience['numberOfFamily'] ?? '-') . ' person, Adult ' . ($experience['adult'] ?? '-') . ', Children ' . ($experience['children'] ?? '-')) as $line) $lines[] = $line;

            $activityLabels = [];
            foreach (($experience['activities'] ?? []) as $activity) {
                if (!empty($activity['checked'])) {
                    $detail = trim((string)($activity['detail'] ?? ''));
                    $activityLabels[] = ($activity['key'] ?? 'activity') . ($detail ? " ($detail)" : '');
                }
            }
            foreach ($wrapPdfText('Responsibilities', implode(', ', $activityLabels) ?: '-') as $line) $lines[] = $line;
            foreach ($wrapPdfText('Reason of Leave', $experience['reasonOfLeave'] ?? '') as $line) $lines[] = $line;
            foreach ($wrapPdfText('Remarks', $experience['remarks'] ?? '') as $line) $lines[] = $line;
            foreach ($wrapPdfText('Strong Points', $experience['strongPoints'] ?? '') as $line) $lines[] = $line;
            $lines[] = '';
        }

        $pages = array_chunk($lines, 42);
        $objects = [];
        $objects[] = '<< /Type /Catalog /Pages 2 0 R >>';
        $pageKids = [];
        $pageObjectNumbers = [];
        $contentObjectNumbers = [];
        $nextObjectNumber = 4;

        foreach ($pages as $pageIndex => $pageLines) {
            $pageObjectNumbers[] = $nextObjectNumber++;
            $contentObjectNumbers[] = $nextObjectNumber++;
        }

        foreach ($pageObjectNumbers as $pageObjectNumber) {
            $pageKids[] = $pageObjectNumber . ' 0 R';
        }

        $objects[] = '<< /Type /Pages /Kids [' . implode(' ', $pageKids) . '] /Count ' . count($pageKids) . ' >>';
        $objects[] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

        foreach ($pages as $pageIndex => $pageLines) {
            $content = "BT\n/F1 10 Tf\n50 790 Td\n14 TL\n";
            foreach ($pageLines as $lineIndex => $line) {
                if ($lineIndex > 0) {
                    $content .= "T*\n";
                }
                $font = $lineIndex < 2 && $pageIndex === 0 ? '/F1 14 Tf ' : '/F1 10 Tf ';
                $content .= $font . '(' . $pdfSafeText($line) . ") Tj\n";
            }
            $content .= "ET\n";

            $objects[] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' . $contentObjectNumbers[$pageIndex] . ' 0 R >>';
            $objects[] = '<< /Length ' . strlen($content) . " >>\nstream\n" . $content . "endstream";
        }

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1) . " 0 obj\n" . $object . "\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n$xref\n%%EOF";

        return $pdf;
    };
    $buildTemplateCandidatePdf = function ($candidate, $photoPath = null) use ($pdfSafeText, $formatSex, $formatTitleCase) {
        $templatePath = __DIR__ . '/../public/templates/templete.pdf';
        $pdf = file_get_contents($templatePath);

        if ($pdf === false) {
            throw new Exception('Unable to read PDF template');
        }

        if (!preg_match_all('/(\d+)\s+0\s+obj\s*(.*?)\s*endobj/s', $pdf, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
            throw new Exception('Unable to parse PDF template');
        }

        $maxObject = 0;
        $pageObjectNumber = null;
        $pageBody = null;

        foreach ($matches as $match) {
            $objectNumber = (int)$match[1][0];
            $body = $match[2][0];
            $maxObject = max($maxObject, $objectNumber);

            if (strpos($body, '/Type/Page') !== false && strpos($body, '/Type/Pages') === false) {
                $pageObjectNumber = $objectNumber;
                $pageBody = $body;
            }
        }

        if (!$pageObjectNumber || !$pageBody) {
            throw new Exception('PDF template page not found');
        }

        preg_match('/startxref\s+(\d+)\s+%%EOF\s*$/s', $pdf, $startXrefMatch);
        $previousXref = isset($startXrefMatch[1]) ? (int)$startXrefMatch[1] : 0;

        $toIsoDate = function ($value) {
            $text = trim((string)($value ?? ''));
            if ($text === '') return '';
            $timestamp = strtotime($text);
            return $timestamp ? date('d-m-Y', $timestamp) : $text;
        };
        $ageFromBirthDate = function ($birthDate, $fallbackAge) {
            if (!empty($fallbackAge)) return (string)$fallbackAge;
            $timestamp = strtotime((string)$birthDate);
            if (!$timestamp) return '';

            $birth = new DateTime(date('Y-m-d', $timestamp));
            return (string)$birth->diff(new DateTime())->y;
        };
        $activityLabels = [
            'houseCleaning' => 'House Cleaning',
            'laundriesIroning' => 'Doing the laundries & Ironing',
            'marketCooking' => 'Go to market & Cooking',
            'newBornBabies' => 'Care of new-born babies',
            'youngChildren' => 'Care of young children',
            'elderly' => 'Care of elderly',
            'disabled' => 'Care of disabled',
            'illPeople' => 'Care of ill people',
            'feedingMedication' => 'Feeding and taking medication',
            'pet' => 'Caring a pet',
            'gardening' => 'Gardening',
            'carWashing' => 'Car Washing',
        ];
        $workExperiences = [];
        if (!empty($candidate['work_experience'])) {
            $decoded = json_decode($candidate['work_experience'], true);
            $workExperiences = is_array($decoded) ? $decoded : [];
        }
        $formatActivities = function ($experience) use ($activityLabels) {
            $selected = [];
            foreach (($experience['activities'] ?? []) as $activity) {
                if (empty($activity['checked'])) continue;

                $label = $activityLabels[$activity['key'] ?? ''] ?? ($activity['key'] ?? '');
                $detail = trim((string)($activity['detail'] ?? ''));
                $selected[] = $label . ($detail ? " ($detail)" : '');
            }
            return implode(', ', $selected);
        };
        $wrap = function ($value, $length = 42) {
            $text = preg_replace('/\s+/', ' ', trim((string)($value ?? '')));
            if ($text === '') return [''];

            $lines = [];
            while (strlen($text) > $length) {
                $break = strrpos(substr($text, 0, $length), ' ');
                $break = $break === false ? $length : $break;
                $lines[] = substr($text, 0, $break);
                $text = ltrim(substr($text, $break));
            }
            $lines[] = $text;
            return $lines;
        };

        $content = "q\nBT\n/F1 8 Tf\n0 0 0 rg\n";
        $addText = function ($x, $y, $text, $size = 8) use (&$content, $pdfSafeText) {
            $content .= "1 0 0 1 $x $y Tm /F1 $size Tf (" . $pdfSafeText($text) . ") Tj\n";
        };
        $addWrappedText = function ($x, $y, $text, $lineHeight = 10, $size = 8, $length = 42) use ($addText, $wrap) {
            foreach ($wrap($text, $length) as $index => $line) {
                $addText($x, $y - ($index * $lineHeight), $line, $size);
            }
        };

        $addText(92, 889, $candidate['name'] ?? '');
        $addText(92, 873, $ageFromBirthDate($candidate['birth_date'] ?? '', $candidate['age'] ?? ''));
        $addText(92, 857, $candidate['last_education'] ?? '');
        $addText(92, 841, $candidate['religion'] ?? '');
        $addText(92, 825, $formatTitleCase($candidate['marital_status'] ?? ''));
        $addText(92, 809, $formatSex($candidate['sex'] ?? ''));
        $addWrappedText(92, 793, $candidate['home_address'] ?? '', 9, 8, 46);
        $addText(92, 755, $toIsoDate($candidate['birth_date'] ?? ''));
        $addText(92, 739, $candidate['place_of_birth'] ?? '');
        $addText(92, 723, !empty($candidate['weight']) ? $candidate['weight'] . ' kg' : '');
        $addText(92, 707, !empty($candidate['height']) ? $candidate['height'] . ' cm' : '');
        $addText(92, 691, $candidate['phone'] ?? '');
        $addText(420, 924, $toIsoDate($candidate['created_at'] ?? date('Y-m-d')));

        $addText(124, 650, $candidate['husband_name'] ?? '');
        $addText(124, 634, !empty($candidate['husband_age']) ? $candidate['husband_age'] . ' y.o' : '');
        $addText(124, 618, $candidate['husband_occupation'] ?? '');
        $addText(124, 602, $candidate['number_of_children'] ?? '');
        $addText(124, 586, !empty($candidate['children_age']) ? $candidate['children_age'] . ' y.o' : '');
        $addText(124, 570, $candidate['number_of_brother'] ?? '');
        $addText(124, 554, $candidate['number_of_sister'] ?? '');
        $addText(124, 538, $candidate['father_name'] ?? '');
        $addText(124, 522, !empty($candidate['father_age']) ? $candidate['father_age'] . ' y.o' : '');
        $addText(124, 506, $candidate['father_occupation'] ?? '');
        $addText(124, 490, $candidate['mother_name'] ?? '');
        $addText(124, 474, !empty($candidate['mother_age']) ? $candidate['mother_age'] . ' y.o' : '');
        $addText(124, 458, $candidate['mother_occupation'] ?? '');
        $addText(124, 442, $candidate['family_rank'] ?? '');

        foreach ([0, 1] as $index) {
            $experience = $workExperiences[$index] ?? [];
            $baseY = $index === 0 ? 374 : 174;
            $addText(72, $baseY, $experience['from'] ?? '');
            $addText(155, $baseY, $experience['to'] ?? '');
            $addText(270, $baseY, $experience['employerName'] ?? '');
            $addWrappedText(72, $baseY - 18, $experience['address'] ?? '', 8, 7, 54);
            $addText(72, $baseY - 48, !empty($experience['numberOfFamily']) ? $experience['numberOfFamily'] . ' person' : '');
            $addText(180, $baseY - 48, $experience['adult'] ?? '');
            $addText(260, $baseY - 48, !empty($experience['children']) ? $experience['children'] . ' y.o' : '');
            $addWrappedText(72, $baseY - 66, $formatActivities($experience), 8, 6, 88);
            $addWrappedText(72, $baseY - 120, $experience['reasonOfLeave'] ?? '', 8, 7, 72);
            $addWrappedText(72, $baseY - 144, $experience['remarks'] ?? '', 8, 7, 72);
            $addWrappedText(72, $baseY - 168, $experience['strongPoints'] ?? '', 8, 7, 72);
        }

        $content .= "ET\nQ\n";

        $imageObjectNumber = null;
        $imageContent = '';
        if ($photoPath && file_exists($photoPath) && function_exists('imagecreatefromstring')) {
            $image = @imagecreatefromstring(file_get_contents($photoPath));
            if ($image) {
                $width = imagesx($image);
                $height = imagesy($image);
                ob_start();
                imagejpeg($image, null, 88);
                $jpeg = ob_get_clean();
                imagedestroy($image);

                $imageObjectNumber = $maxObject + 2;
                $imageContent = "q\n247 0 0 358 312 619 cm\n/PublishedPhoto Do\nQ\n";
            }
        }

        if ($imageContent) {
            $content = $imageContent . $content;
        }

        $contentObjectNumber = $maxObject + 1;
        $newMaxObject = $imageObjectNumber ?: $contentObjectNumber;
        $newPageBody = preg_replace(
            '/\/Contents\s+(\d+\s+0\s+R|\[[^\]]+\])/',
            '/Contents [$1 ' . $contentObjectNumber . ' 0 R]',
            $pageBody,
            1
        );

        if ($imageObjectNumber) {
            $newPageBody = preg_replace(
                '/\/XObject<<([^>]*)>>/',
                '/XObject<<$1/PublishedPhoto ' . $imageObjectNumber . ' 0 R>>',
                $newPageBody,
                1
            );
        }

        $objects = [
            $contentObjectNumber => "<< /Length " . strlen($content) . " >>\nstream\n" . $content . "endstream",
            $pageObjectNumber => $newPageBody,
        ];

        if ($imageObjectNumber) {
            $objects[$imageObjectNumber] = "<< /Type /XObject /Subtype /Image /Width $width /Height $height /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " . strlen($jpeg) . " >>\nstream\n" . $jpeg . "\nendstream";
        }

        ksort($objects);
        $append = "\n";
        $offsets = [];
        foreach ($objects as $objectNumber => $objectBody) {
            $offsets[$objectNumber] = strlen($pdf) + strlen($append);
            $append .= "$objectNumber 0 obj\n$objectBody\nendobj\n";
        }

        $xrefOffset = strlen($pdf) + strlen($append);
        $append .= "xref\n";
        $runs = [];
        foreach (array_keys($objects) as $objectNumber) {
            if (!$runs || end($runs)['last'] + 1 !== $objectNumber) {
                $runs[] = ['start' => $objectNumber, 'last' => $objectNumber];
            } else {
                $runs[count($runs) - 1]['last'] = $objectNumber;
            }
        }

        foreach ($runs as $run) {
            $count = $run['last'] - $run['start'] + 1;
            $append .= $run['start'] . " $count\n";
            for ($objectNumber = $run['start']; $objectNumber <= $run['last']; $objectNumber++) {
                $append .= sprintf("%010d 00000 n \n", $offsets[$objectNumber]);
            }
        }

        $append .= "trailer\n<< /Size " . ($newMaxObject + 1) . " /Root 1 0 R";
        if ($previousXref > 0) {
            $append .= " /Prev $previousXref";
        }
        $append .= " >>\nstartxref\n$xrefOffset\n%%EOF";

        return $pdf . $append;
    };

    $buildXlsxTemplateCandidateWorkbook = function ($candidate, $photoPath = null) use ($formatSex, $formatTitleCase, $resolveCvTemplatePath) {
        $templatePath = $resolveCvTemplatePath();
        if (!$templatePath) {
            throw new Exception('CV template not found');
        }

        $tempPath = tempnam(sys_get_temp_dir(), 'cv_template_');
        if (!$tempPath || !copy($templatePath, $tempPath)) {
            throw new Exception('Unable to prepare XLSX template');
        }

        $ageFromBirthDate = function ($birthDate, $fallbackAge) {
            if (!empty($fallbackAge)) return (string)$fallbackAge;
            $timestamp = strtotime((string)$birthDate);
            if (!$timestamp) return '';

            $birth = new DateTime(date('Y-m-d', $timestamp));
            return (string)$birth->diff(new DateTime())->y;
        };
        $toDisplayDate = function ($value) {
            $text = trim((string)($value ?? ''));
            if ($text === '') return '';
            $timestamp = strtotime($text);
            return $timestamp ? date('d-m-Y', $timestamp) : $text;
        };
        $splitCellLines = function ($value, $maxLines = 3, $maxLength = 45) {
            $text = preg_replace('/\s+/', ' ', trim((string)($value ?? '')));
            if ($text === '') return [];

            $lines = [];
            while ($text !== '' && count($lines) < $maxLines) {
                if (strlen($text) <= $maxLength) {
                    $lines[] = $text;
                    break;
                }

                $break = strrpos(substr($text, 0, $maxLength), ' ');
                $break = $break === false ? $maxLength : $break;
                $lines[] = trim(substr($text, 0, $break));
                $text = ltrim(substr($text, $break));
            }

            return $lines;
        };
        $workExperiences = [];
        if (!empty($candidate['work_experience'])) {
            $decoded = json_decode($candidate['work_experience'], true);
            $workExperiences = is_array($decoded) ? $decoded : [];
        }

        $activityRows = [
            'houseCleaning' => 50,
            'laundriesIroning' => 51,
            'marketCooking' => 52,
            'newBornBabies' => 53,
            'youngChildren' => 54,
            'elderly' => 55,
            'disabled' => 56,
            'illPeople' => 57,
            'feedingMedication' => 59,
            'pet' => 60,
            'gardening' => 61,
            'carWashing' => 62,
        ];
        $activityDetailCells = [
            0 => [
                'newBornBabies' => 'M52',
                'youngChildren' => 'O54',
                'elderly' => 'N54',
                'disabled' => 'N55',
                'pet' => 'O60',
                'carWashing' => 'O62',
            ],
            1 => [
                'newBornBabies' => 'AJ53',
                'youngChildren' => 'AJ54',
                'elderly' => 'AJ55',
                'disabled' => 'AJ56',
                'pet' => 'AJ60',
                'carWashing' => 'AJ62',
            ],
        ];

        $cellMap = [
            'AL4' => $candidate['reference_no'] ?? '',
            'AJ5' => $toDisplayDate($candidate['register_date'] ?? ''),
            'K20' => $candidate['name'] ?? '',
            'K21' => $ageFromBirthDate($candidate['birth_date'] ?? '', $candidate['age'] ?? ''),
            'K22' => $candidate['last_education'] ?? '',
            'K23' => $candidate['religion'] ?? '',
            'K24' => $formatTitleCase($candidate['marital_status'] ?? ''),
            'V24' => $formatSex($candidate['sex'] ?? ''),
            'K25' => $candidate['home_address'] ?? '',
            'K26' => $toDisplayDate($candidate['birth_date'] ?? ''),
            'K27' => $candidate['place_of_birth'] ?? '',
            'K28' => $candidate['weight'] ?? '',
            'K29' => $candidate['height'] ?? '',
            'K30' => $candidate['phone'] ?? '',
            'K34' => $candidate['husband_name'] ?? '',
            'K35' => $candidate['husband_age'] ?? '',
            'K36' => $candidate['husband_occupation'] ?? '',
            'K37' => $candidate['number_of_children'] ?? '',
            'K38' => $candidate['children_age'] ?? '',
            'K39' => $candidate['number_of_brother'] ?? '',
            'M39' => $candidate['brother_age'] ?? '',
            'K40' => $candidate['number_of_sister'] ?? '',
            'M40' => $candidate['sister_age'] ?? '',
            'AG34' => $candidate['father_name'] ?? '',
            'AG35' => $candidate['father_age'] ?? '',
            'AG36' => $candidate['father_occupation'] ?? '',
            'AG37' => $candidate['mother_name'] ?? '',
            'AG38' => $candidate['mother_age'] ?? '',
            'AG39' => $candidate['mother_occupation'] ?? '',
            'AG40' => $candidate['family_rank'] ?? '',
        ];
        $experienceCellSets = [
            0 => [
                'from' => 'E43',
                'to' => 'N43',
                'employerName' => 'N44',
                'address' => 'N45',
                'numberOfFamily' => 'N46',
                'adult' => 'E47',
                'children' => 'N47',
                'activityMarkColumn' => 'A',
                'reasonOfLeave' => 'A63',
                'remarks' => 'N64',
                'strongPoints' => ['A65', 'A66', 'A67'],
            ],
            1 => [
                'from' => 'AA44',
                'to' => 'AJ44',
                'employerName' => 'AJ45',
                'address' => 'AJ46',
                'numberOfFamily' => 'AJ47',
                'adult' => 'AA48',
                'children' => 'AJ48',
                'activityMarkColumn' => 'V',
                'reasonOfLeave' => 'V64',
                'remarks' => 'AJ65',
                'strongPoints' => ['V66', 'V67', 'V68'],
            ],
        ];

        foreach ($experienceCellSets as $index => $cells) {
            $experience = $workExperiences[$index] ?? [];
            $hasValue = false;
            foreach (['from', 'to', 'employerName', 'address', 'numberOfFamily', 'adult', 'children', 'reasonOfLeave', 'remarks', 'strongPoints'] as $field) {
                if (trim((string)($experience[$field] ?? '')) !== '') {
                    $hasValue = true;
                    break;
                }
            }
            if ($index > 0 && !$hasValue && empty($experience['activities'])) {
                continue;
            }

            $cellMap[$cells['from']] = $experience['from'] ?? '';
            $cellMap[$cells['to']] = $experience['to'] ?? '';
            $cellMap[$cells['employerName']] = $experience['employerName'] ?? '';
            $cellMap[$cells['address']] = $experience['address'] ?? '';
            $cellMap[$cells['numberOfFamily']] = $experience['numberOfFamily'] ?? '';
            $cellMap[$cells['adult']] = $experience['adult'] ?? '';
            $cellMap[$cells['children']] = $experience['children'] ?? '';
            $cellMap[$cells['reasonOfLeave']] = $experience['reasonOfLeave'] ?? '';
            $cellMap[$cells['remarks']] = $experience['remarks'] ?? '';

            $strongPointLines = $splitCellLines($experience['strongPoints'] ?? '', 3, $index === 0 ? 55 : 45);
            foreach ($cells['strongPoints'] as $lineIndex => $cellRef) {
                $cellMap[$cellRef] = $strongPointLines[$lineIndex] ?? '';
            }

            foreach (($experience['activities'] ?? []) as $activity) {
                $key = $activity['key'] ?? '';
                if (empty($activity['checked']) || !isset($activityRows[$key])) continue;

                $cellMap[$cells['activityMarkColumn'] . $activityRows[$key]] = 'v';
                $detail = trim((string)($activity['detail'] ?? ''));
                if ($detail !== '' && isset($activityDetailCells[$index][$key])) {
                    $cellMap[$activityDetailCells[$index][$key]] = $detail;
                }
            }
        }

        $zip = new ZipArchive();
        if ($zip->open($tempPath) !== true) {
            @unlink($tempPath);
            throw new Exception('Unable to update XLSX template');
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml === false) {
            $zip->close();
            @unlink($tempPath);
            throw new Exception('Invalid XLSX template');
        }

        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = false;
        $dom->loadXML($sheetXml);
        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        $mainNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

        $setCellValue = function ($cellRef, $value) use ($dom, $xpath, $mainNs) {
            $nodes = $xpath->query("//x:c[@r='$cellRef']");
            if ($nodes->length === 0) {
                return;
            }

            /** @var DOMElement $cell */
            $cell = $nodes->item(0);
            while ($cell->firstChild) {
                $cell->removeChild($cell->firstChild);
            }
            $cell->setAttribute('t', 'inlineStr');

            $inline = $dom->createElementNS($mainNs, 'is');
            $text = $dom->createElementNS($mainNs, 't');
            $text->setAttribute('xml:space', 'preserve');
            $text->appendChild($dom->createTextNode((string)($value ?? '')));
            $inline->appendChild($text);
            $cell->appendChild($inline);
        };

        foreach ($cellMap as $cellRef => $value) {
            $setCellValue($cellRef, $value);
        }

        $zip->addFromString('xl/worksheets/sheet1.xml', $dom->saveXML());

        $workbookXml = $zip->getFromName('xl/workbook.xml');
        if ($workbookXml !== false) {
            $workbookDom = new DOMDocument();
            $workbookDom->preserveWhiteSpace = false;
            $workbookDom->formatOutput = false;
            $workbookDom->loadXML($workbookXml);
            $workbookXpath = new DOMXPath($workbookDom);
            $workbookXpath->registerNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $workbookNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

            $definedNames = $workbookXpath->query('/x:workbook/x:definedNames')->item(0);
            if (!$definedNames) {
                $definedNames = $workbookDom->createElementNS($workbookNs, 'definedNames');
                $calcPr = $workbookXpath->query('/x:workbook/x:calcPr')->item(0);
                if ($calcPr) {
                    $workbookDom->documentElement->insertBefore($definedNames, $calcPr);
                } else {
                    $workbookDom->documentElement->appendChild($definedNames);
                }
            }

            foreach ($workbookXpath->query('/x:workbook/x:definedNames/x:definedName[@name="_xlnm.Print_Area"]') as $oldPrintArea) {
                $definedNames->removeChild($oldPrintArea);
            }

            $printArea = $workbookDom->createElementNS($workbookNs, 'definedName', 'template!$A$1:$AQ$68');
            $printArea->setAttribute('name', '_xlnm.Print_Area');
            $printArea->setAttribute('localSheetId', '0');
            $definedNames->appendChild($printArea);
            $zip->addFromString('xl/workbook.xml', $workbookDom->saveXML());
        }

        if ($photoPath && file_exists($photoPath)) {
            if (!function_exists('imagecreatefromstring')) {
                $zip->close();
                @unlink($tempPath);
                throw new Exception('GD image extension is required to embed candidate photo');
            }

            $image = @imagecreatefromstring(file_get_contents($photoPath));
            if (!$image) {
                $zip->close();
                @unlink($tempPath);
                throw new Exception('Unable to read candidate photo');
            }

            $width = imagesx($image);
            $height = imagesy($image);
            ob_start();
            imagejpeg($image, null, 90);
            $photoJpeg = ob_get_clean();
            imagedestroy($image);

            if ($photoJpeg === false || $photoJpeg === '') {
                $zip->close();
                @unlink($tempPath);
                throw new Exception('Unable to prepare candidate photo');
            }

            $mediaIndex = 1;
            while ($zip->locateName("xl/media/candidate_photo_$mediaIndex.jpeg") !== false) {
                $mediaIndex++;
            }
            $mediaName = "candidate_photo_$mediaIndex.jpeg";
            $mediaPath = "xl/media/$mediaName";
            $zip->addFromString($mediaPath, $photoJpeg);

            $relsPath = 'xl/drawings/_rels/drawing1.xml.rels';
            $relsXml = $zip->getFromName($relsPath);
            if ($relsXml === false) {
                $relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
            }

            $relsDom = new DOMDocument();
            $relsDom->preserveWhiteSpace = false;
            $relsDom->formatOutput = false;
            $relsDom->loadXML($relsXml);
            $relsXpath = new DOMXPath($relsDom);
            $relsXpath->registerNamespace('r', 'http://schemas.openxmlformats.org/package/2006/relationships');

            $nextRelId = 1;
            foreach ($relsXpath->query('//r:Relationship') as $relNode) {
                $id = $relNode->attributes?->getNamedItem('Id')?->nodeValue ?? '';
                if (preg_match('/^rId(\d+)$/', $id, $matches)) {
                    $nextRelId = max($nextRelId, ((int)$matches[1]) + 1);
                }
            }
            $photoRelId = 'rId' . $nextRelId;

            $relationship = $relsDom->createElementNS('http://schemas.openxmlformats.org/package/2006/relationships', 'Relationship');
            $relationship->setAttribute('Id', $photoRelId);
            $relationship->setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
            $relationship->setAttribute('Target', "../media/$mediaName");
            $relsDom->documentElement->appendChild($relationship);
            $zip->addFromString($relsPath, $relsDom->saveXML());

            $drawingPath = 'xl/drawings/drawing1.xml';
            $drawingXml = $zip->getFromName($drawingPath);
            if ($drawingXml === false) {
                $zip->close();
                @unlink($tempPath);
                throw new Exception('XLSX drawing template not found');
            }

            $drawingDom = new DOMDocument();
            $drawingDom->preserveWhiteSpace = false;
            $drawingDom->formatOutput = false;
            $drawingDom->loadXML($drawingXml);
            $drawingXpath = new DOMXPath($drawingDom);
            $drawingXpath->registerNamespace('xdr', 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing');

            $nextPictureId = 1;
            foreach ($drawingXpath->query('//xdr:cNvPr') as $pictureNode) {
                $id = $pictureNode->attributes?->getNamedItem('id')?->nodeValue;
                if (is_numeric($id)) {
                    $nextPictureId = max($nextPictureId, ((int)$id) + 1);
                }
            }

            $anchorXml = sprintf(
                '<xdr:twoCellAnchor xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
                . '<xdr:from><xdr:col>29</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>6</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>'
                . '<xdr:to><xdr:col>43</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>30</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'
                . '<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="%d" name="candidate_photo.jpeg"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>'
                . '<xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="%s"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>'
                . '<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:twoCellAnchor>',
                $nextPictureId,
                htmlspecialchars($photoRelId, ENT_XML1),
                max(1, $width) * 9525,
                max(1, $height) * 9525
            );

            $anchorDom = new DOMDocument();
            $anchorDom->loadXML($anchorXml);
            $anchor = $drawingDom->importNode($anchorDom->documentElement, true);
            $drawingDom->documentElement->appendChild($anchor);
            $zip->addFromString($drawingPath, $drawingDom->saveXML());
        }

        $zip->close();

        $contents = file_get_contents($tempPath);
        @unlink($tempPath);

        if ($contents === false) {
            throw new Exception('Unable to read generated XLSX');
        }

        return $contents;
    };

    $findSpreadsheetPdfConverter = function () {
        $candidates = [
            'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
            '/usr/bin/libreoffice',
            '/usr/local/bin/libreoffice',
            '/snap/bin/libreoffice',
            '/usr/bin/soffice',
            '/usr/local/bin/soffice',
            '/opt/libreoffice/program/soffice',
        ];

        foreach ($candidates as $candidatePath) {
            if (file_exists($candidatePath) && is_executable($candidatePath)) {
                return $candidatePath;
            }
        }

        $whereOutput = [];
        $whereCode = 1;
        @exec('where soffice 2>NUL', $whereOutput, $whereCode);
        if ($whereCode === 0 && !empty($whereOutput[0]) && file_exists($whereOutput[0])) {
            return $whereOutput[0];
        }

        foreach (['libreoffice', 'soffice'] as $binary) {
            $commandOutput = [];
            $commandCode = 1;
            @exec('command -v ' . escapeshellarg($binary) . ' 2>/dev/null', $commandOutput, $commandCode);
            if ($commandCode === 0 && !empty($commandOutput[0]) && is_executable($commandOutput[0])) {
                return $commandOutput[0];
            }
        }

        return null;
    };

    $convertXlsxToPdf = function ($xlsxPath, $pdfPath) use ($findSpreadsheetPdfConverter) {
        $converter = $findSpreadsheetPdfConverter();
        if (!$converter) {
            throw new Exception('Spreadsheet PDF converter not available on server. Install LibreOffice and make sure libreoffice or soffice is executable by PHP.');
        }

        $outputDir = dirname($pdfPath);
        $profileDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'lo_profile_' . uniqid('', true);
        ensureDir($profileDir);

        $normalizedProfileDir = str_replace('\\', '/', $profileDir);
        $profileUri = preg_match('/^[A-Za-z]:\//', $normalizedProfileDir)
            ? 'file:///' . $normalizedProfileDir
            : 'file://' . $normalizedProfileDir;
        $command = escapeshellarg($converter)
            . ' --headless --nologo --nofirststartwizard'
            . ' -env:UserInstallation=' . escapeshellarg($profileUri)
            . ' --convert-to pdf --outdir ' . escapeshellarg($outputDir)
            . ' ' . escapeshellarg($xlsxPath) . ' 2>&1';

        $output = [];
        $exitCode = 1;
        @exec($command, $output, $exitCode);

        $generatedPdf = $outputDir . DIRECTORY_SEPARATOR . pathinfo($xlsxPath, PATHINFO_FILENAME) . '.pdf';
        if ($exitCode !== 0 || !file_exists($generatedPdf)) {
            throw new Exception('Failed to convert XLSX to PDF using LibreOffice: ' . trim(implode(' ', $output)));
        }

        if (realpath($generatedPdf) !== realpath($pdfPath)) {
            if (file_exists($pdfPath)) {
                deleteFile($pdfPath);
            }
            if (!rename($generatedPdf, $pdfPath)) {
                throw new Exception('Failed to move generated PDF into storage');
            }
        }

        return $pdfPath;
    };

    $getConvertApiSecret = function () {
        $secret = trim((string)getenv('CONVERTAPI_SECRET'));
        if ($secret !== '') {
            return $secret;
        }

        $config = Flight::get('config');
        return trim((string)($config['convertapi']['secret'] ?? ''));
    };

    $convertXlsxToPdfWithApi = function ($xlsxPath, $pdfPath) use ($getConvertApiSecret) {
        $secret = $getConvertApiSecret();
        if ($secret === '') {
            throw new Exception('ConvertAPI secret is not configured.');
        }

        if (!function_exists('curl_init')) {
            throw new Exception('PHP cURL extension is required for ConvertAPI.');
        }

        $endpoint = 'https://v2.convertapi.com/convert/xlsx/to/pdf?Secret=' . rawurlencode($secret);
        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_POSTFIELDS => [
                'File' => new CURLFile($xlsxPath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', basename($xlsxPath)),
                'StoreFile' => 'false',
            ],
        ]);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $statusCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            throw new Exception('ConvertAPI request failed: ' . $curlError);
        }

        $json = json_decode($response, true);
        if ($statusCode < 200 || $statusCode >= 300) {
            $message = $json['Message'] ?? $json['message'] ?? trim($response);
            throw new Exception('ConvertAPI conversion failed: ' . $message);
        }

        $file = $json['Files'][0] ?? null;
        if (!$file) {
            throw new Exception('ConvertAPI response did not include a PDF file.');
        }

        if (!empty($file['FileData'])) {
            $pdf = base64_decode($file['FileData'], true);
            if ($pdf === false || $pdf === '') {
                throw new Exception('ConvertAPI returned invalid PDF data.');
            }
            file_put_contents($pdfPath, $pdf);
            return $pdfPath;
        }

        if (!empty($file['Url'])) {
            $pdf = file_get_contents($file['Url']);
            if ($pdf === false || $pdf === '') {
                throw new Exception('Unable to download converted PDF from ConvertAPI.');
            }
            file_put_contents($pdfPath, $pdf);
            return $pdfPath;
        }

        throw new Exception('ConvertAPI response did not include FileData or Url.');
    };

    $buildXlsxTemplateCandidatePdf = function ($candidate, $photoPath = null) use ($pdfSafeText, $formatSex, $formatTitleCase, $resolveCvTemplatePath) {
        $templatePath = $resolveCvTemplatePath();
        if (!$templatePath) {
            throw new Exception('CV template not found');
        }
        $zip = new ZipArchive();

        if ($zip->open($templatePath) !== true) {
            throw new Exception('Unable to read XLSX template');
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        $stylesXml = $zip->getFromName('xl/styles.xml');
        $themeXml = $zip->getFromName('xl/theme/theme1.xml');
        $logoImage = $zip->getFromName('xl/media/image1.jpeg');
        $zip->close();

        if ($sheetXml === false || $sharedStringsXml === false || $stylesXml === false) {
            throw new Exception('Invalid XLSX template');
        }

        $sharedStrings = [];
        $shared = simplexml_load_string($sharedStringsXml);
        if ($shared) {
            $shared->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            foreach ($shared->xpath('//x:si') as $si) {
                $si->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                $parts = [];
                foreach ($si->xpath('.//x:t') as $textNode) {
                    $parts[] = (string)$textNode;
                }
                $sharedStrings[] = implode('', $parts);
            }
        }

        $sheet = simplexml_load_string($sheetXml);
        if (!$sheet) {
            throw new Exception('Unable to parse XLSX sheet');
        }

        $sheet->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');

        $columnNameToNumber = function ($column) {
            $number = 0;
            foreach (str_split(strtoupper($column)) as $char) {
                $number = ($number * 26) + (ord($char) - 64);
            }
            return $number;
        };
        $splitCell = function ($cell) use ($columnNameToNumber) {
            preg_match('/^([A-Z]+)(\d+)$/', strtoupper($cell), $matches);
            return [
                'col' => $columnNameToNumber($matches[1] ?? 'A'),
                'row' => (int)($matches[2] ?? 1),
            ];
        };
        $themeColors = [];
        if ($themeXml !== false) {
            $theme = simplexml_load_string($themeXml);
            if ($theme) {
                $theme->registerXPathNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main');
                foreach ($theme->xpath('//a:clrScheme/*') as $colorNode) {
                    $colorNode->registerXPathNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main');
                    $srgb = $colorNode->xpath('.//a:srgbClr');
                    $sys = $colorNode->xpath('.//a:sysClr');
                    if ($srgb && isset($srgb[0]['val'])) {
                        $themeColors[$colorNode->getName()] = strtoupper((string)$srgb[0]['val']);
                    } elseif ($sys && isset($sys[0]['lastClr'])) {
                        $themeColors[$colorNode->getName()] = strtoupper((string)$sys[0]['lastClr']);
                    }
                }
            }
        }
        $applyTint = function ($hex, $tint) {
            if (!preg_match('/^[A-F0-9]{6}$/i', $hex)) return '000000';
            $tint = (float)$tint;
            $rgb = [
                hexdec(substr($hex, 0, 2)),
                hexdec(substr($hex, 2, 2)),
                hexdec(substr($hex, 4, 2)),
            ];
            foreach ($rgb as &$part) {
                $part = $tint < 0
                    ? (int)round($part * (1 + $tint))
                    : (int)round($part + ((255 - $part) * $tint));
                $part = max(0, min(255, $part));
            }
            return sprintf('%02X%02X%02X', $rgb[0], $rgb[1], $rgb[2]);
        };
        $readColor = function ($colorNode) use ($themeColors, $applyTint) {
            if (!$colorNode) return '000000';
            $attrs = $colorNode->attributes();
            if (isset($attrs['rgb'])) {
                $rgb = strtoupper((string)$attrs['rgb']);
                return strlen($rgb) === 8 ? substr($rgb, 2) : $rgb;
            }
            if (isset($attrs['theme'])) {
                $themeIndex = (int)$attrs['theme'];
                $themeMap = [
                    0 => 'lt1',
                    1 => 'dk1',
                    2 => 'lt2',
                    3 => 'dk2',
                    4 => 'accent1',
                    5 => 'accent2',
                    6 => 'accent3',
                    7 => 'accent4',
                    8 => 'accent5',
                    9 => 'accent6',
                    10 => 'hlink',
                    11 => 'folHlink',
                ];
                $hex = $themeColors[$themeMap[$themeIndex] ?? 'dk1'] ?? ($themeIndex === 0 ? 'FFFFFF' : '000000');
                return isset($attrs['tint']) ? $applyTint($hex, (float)$attrs['tint']) : $hex;
            }
            return '000000';
        };
        $xlsxStyles = [
            'fonts' => [['size' => 11.0, 'bold' => false, 'color' => '000000']],
            'borders' => [[
                'left' => null,
                'right' => null,
                'top' => null,
                'bottom' => null,
            ]],
            'cellXfs' => [['fontId' => 0, 'borderId' => 0, 'horizontal' => null]],
            'cellStyleIndexes' => [],
        ];
        $styles = simplexml_load_string($stylesXml);
        if ($styles) {
            $styles->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $xlsxStyles['fonts'] = [];
            foreach ($styles->xpath('//x:fonts/x:font') as $font) {
                $font->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                $sizeNode = $font->xpath('./x:sz');
                $colorNode = $font->xpath('./x:color');
                $xlsxStyles['fonts'][] = [
                    'size' => $sizeNode && isset($sizeNode[0]['val']) ? (float)$sizeNode[0]['val'] : 11.0,
                    'bold' => count($font->xpath('./x:b')) > 0,
                    'color' => $colorNode ? $readColor($colorNode[0]) : '000000',
                ];
            }
            $xlsxStyles['borders'] = [];
            foreach ($styles->xpath('//x:borders/x:border') as $border) {
                $border->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                $edges = [];
                foreach (['left', 'right', 'top', 'bottom'] as $edge) {
                    $edgeNode = $border->xpath('./x:' . $edge);
                    $edgeStyle = null;
                    if ($edgeNode) {
                        $edgeNode[0]->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                        $edgeAttrs = $edgeNode[0]->attributes();
                        if (isset($edgeAttrs['style'])) {
                            $colorNode = $edgeNode[0]->xpath('./x:color');
                            $edgeStyle = [
                                'style' => (string)$edgeAttrs['style'],
                                'color' => $colorNode ? $readColor($colorNode[0]) : '000000',
                            ];
                        }
                    }
                    $edges[$edge] = $edgeStyle;
                }
                $xlsxStyles['borders'][] = $edges;
            }
            $xlsxStyles['cellXfs'] = [];
            foreach ($styles->xpath('//x:cellXfs/x:xf') as $xf) {
                $xf->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                $attrs = $xf->attributes();
                $alignment = $xf->xpath('./x:alignment');
                $xlsxStyles['cellXfs'][] = [
                    'fontId' => isset($attrs['fontId']) ? (int)$attrs['fontId'] : 0,
                    'borderId' => isset($attrs['borderId']) ? (int)$attrs['borderId'] : 0,
                    'horizontal' => $alignment && isset($alignment[0]['horizontal']) ? (string)$alignment[0]['horizontal'] : null,
                ];
            }
        }
        foreach ($sheet->xpath('//x:sheetData/x:row/x:c') as $cellNode) {
            $attrs = $cellNode->attributes();
            if (isset($attrs['r']) && isset($attrs['s'])) {
                $xlsxStyles['cellStyleIndexes'][(string)$attrs['r']] = (int)$attrs['s'];
            }
        }
        $styleForCell = function ($cellRef) use ($xlsxStyles) {
            $styleIndex = $xlsxStyles['cellStyleIndexes'][$cellRef] ?? 0;
            $xf = $xlsxStyles['cellXfs'][$styleIndex] ?? ['fontId' => 0, 'horizontal' => null];
            $font = $xlsxStyles['fonts'][$xf['fontId'] ?? 0] ?? ['size' => 11.0, 'bold' => false, 'color' => '000000'];
            return [
                'size' => max(4.0, min(14.0, ((float)$font['size']) * 0.72)),
                'font' => !empty($font['bold']) ? 'F2' : 'F1',
                'color' => $font['color'] ?? '000000',
                'horizontal' => $xf['horizontal'] ?? null,
            ];
        };
        $borderForCell = function ($cellRef) use ($xlsxStyles) {
            $styleIndex = $xlsxStyles['cellStyleIndexes'][$cellRef] ?? 0;
            $xf = $xlsxStyles['cellXfs'][$styleIndex] ?? ['borderId' => 0];
            return $xlsxStyles['borders'][$xf['borderId'] ?? 0] ?? [
                'left' => null,
                'right' => null,
                'top' => null,
                'bottom' => null,
            ];
        };
        $unicodeFontRegular = 'C:\\Windows\\Fonts\\ARIALUNI.TTF';
        $unicodeFontBold = file_exists('C:\\Windows\\Fonts\\msyhbd.ttc')
            ? 'C:\\Windows\\Fonts\\msyhbd.ttc'
            : $unicodeFontRegular;
        $ageFromBirthDate = function ($birthDate, $fallbackAge) {
            if (!empty($fallbackAge)) return (string)$fallbackAge;
            $timestamp = strtotime((string)$birthDate);
            if (!$timestamp) return '';

            $birth = new DateTime(date('Y-m-d', $timestamp));
            return (string)$birth->diff(new DateTime())->y;
        };
        $toDisplayDate = function ($value) {
            $text = trim((string)($value ?? ''));
            if ($text === '') return '';
            $timestamp = strtotime($text);
            return $timestamp ? date('d-m-Y', $timestamp) : $text;
        };
        $splitCellLines = function ($value, $maxLines = 3, $maxLength = 45) {
            $text = preg_replace('/\s+/', ' ', trim((string)($value ?? '')));
            if ($text === '') return [];

            $lines = [];
            while ($text !== '' && count($lines) < $maxLines) {
                if (strlen($text) <= $maxLength) {
                    $lines[] = $text;
                    break;
                }

                $break = strrpos(substr($text, 0, $maxLength), ' ');
                $break = $break === false ? $maxLength : $break;
                $lines[] = trim(substr($text, 0, $break));
                $text = ltrim(substr($text, $break));
            }

            return $lines;
        };
        $workExperiences = [];
        if (!empty($candidate['work_experience'])) {
            $decoded = json_decode($candidate['work_experience'], true);
            $workExperiences = is_array($decoded) ? $decoded : [];
        }
        $maxColumn = $columnNameToNumber('AQ');
        $maxRow = 68;
        $activityRows = [
            'houseCleaning' => 50,
            'laundriesIroning' => 51,
            'marketCooking' => 52,
            'newBornBabies' => 53,
            'youngChildren' => 54,
            'elderly' => 55,
            'disabled' => 56,
            'illPeople' => 57,
            'feedingMedication' => 59,
            'pet' => 60,
            'gardening' => 61,
            'carWashing' => 62,
        ];
        $activityDetailCells = [
            0 => [
                'newBornBabies' => 'M52',
                'youngChildren' => 'O54',
                'elderly' => 'N54',
                'disabled' => 'N55',
                'pet' => 'O60',
                'carWashing' => 'O62',
            ],
            1 => [
                'newBornBabies' => 'AJ53',
                'youngChildren' => 'AJ54',
                'elderly' => 'AJ55',
                'disabled' => 'AJ56',
                'pet' => 'AJ60',
                'carWashing' => 'AJ62',
            ],
        ];

        $cellMap = [
            'AL4' => $candidate['reference_no'] ?? '',
            'AJ5' => $toDisplayDate($candidate['register_date'] ?? ''),
            'K20' => $candidate['name'] ?? '',
            'K21' => $ageFromBirthDate($candidate['birth_date'] ?? '', $candidate['age'] ?? ''),
            'K22' => $candidate['last_education'] ?? '',
            'K23' => $candidate['religion'] ?? '',
            'K24' => $formatTitleCase($candidate['marital_status'] ?? ''),
            'V24' => $formatSex($candidate['sex'] ?? ''),
            'K25' => $candidate['home_address'] ?? '',
            'K26' => $toDisplayDate($candidate['birth_date'] ?? ''),
            'K27' => $candidate['place_of_birth'] ?? '',
            'K28' => $candidate['weight'] ?? '',
            'K29' => $candidate['height'] ?? '',
            'K30' => $candidate['phone'] ?? '',
            'K34' => $candidate['husband_name'] ?? '',
            'K35' => $candidate['husband_age'] ?? '',
            'K36' => $candidate['husband_occupation'] ?? '',
            'K37' => $candidate['number_of_children'] ?? '',
            'K38' => $candidate['children_age'] ?? '',
            'K39' => $candidate['number_of_brother'] ?? '',
            'M39' => $candidate['brother_age'] ?? '',
            'K40' => $candidate['number_of_sister'] ?? '',
            'M40' => $candidate['sister_age'] ?? '',
            'AG34' => $candidate['father_name'] ?? '',
            'AG35' => $candidate['father_age'] ?? '',
            'AG36' => $candidate['father_occupation'] ?? '',
            'AG37' => $candidate['mother_name'] ?? '',
            'AG38' => $candidate['mother_age'] ?? '',
            'AG39' => $candidate['mother_occupation'] ?? '',
            'AG40' => $candidate['family_rank'] ?? '',
        ];
        $experienceCellSets = [
            0 => [
                'from' => 'E43',
                'to' => 'N43',
                'employerName' => 'N44',
                'address' => 'N45',
                'numberOfFamily' => 'N46',
                'adult' => 'E47',
                'children' => 'N47',
                'activityMarkColumn' => 'A',
                'reasonOfLeave' => 'A63',
                'remarks' => 'N64',
                'strongPoints' => ['A65', 'A66', 'A67'],
            ],
            1 => [
                'from' => 'AA44',
                'to' => 'AJ44',
                'employerName' => 'AJ45',
                'address' => 'AJ46',
                'numberOfFamily' => 'AJ47',
                'adult' => 'AA48',
                'children' => 'AJ48',
                'activityMarkColumn' => 'V',
                'reasonOfLeave' => 'V64',
                'remarks' => 'AJ65',
                'strongPoints' => ['V66', 'V67', 'V68'],
            ],
        ];

        foreach ($experienceCellSets as $index => $cells) {
            $experience = $workExperiences[$index] ?? [];
            $cellMap[$cells['from']] = $experience['from'] ?? '';
            $cellMap[$cells['to']] = $experience['to'] ?? '';
            $cellMap[$cells['employerName']] = $experience['employerName'] ?? '';
            $cellMap[$cells['address']] = $experience['address'] ?? '';
            $cellMap[$cells['numberOfFamily']] = $experience['numberOfFamily'] ?? '';
            $cellMap[$cells['adult']] = $experience['adult'] ?? '';
            $cellMap[$cells['children']] = $experience['children'] ?? '';
            $cellMap[$cells['reasonOfLeave']] = $experience['reasonOfLeave'] ?? '';
            $cellMap[$cells['remarks']] = $experience['remarks'] ?? '';

            $strongPointLines = $splitCellLines($experience['strongPoints'] ?? '', 3, $index === 0 ? 55 : 45);
            foreach ($cells['strongPoints'] as $lineIndex => $cellRef) {
                $cellMap[$cellRef] = $strongPointLines[$lineIndex] ?? '';
            }

            foreach (($experience['activities'] ?? []) as $activity) {
                $key = $activity['key'] ?? '';
                if (empty($activity['checked']) || !isset($activityRows[$key])) continue;

                $cellMap[$cells['activityMarkColumn'] . $activityRows[$key]] = 'v';
                $detail = trim((string)($activity['detail'] ?? ''));
                if ($detail !== '' && isset($activityDetailCells[$index][$key])) {
                    $cellMap[$activityDetailCells[$index][$key]] = $detail;
                }
            }
        }

        $colWidths = array_fill(1, $maxColumn, 64.0);
        foreach ($sheet->xpath('//x:cols/x:col') as $col) {
            $attrs = $col->attributes();
            $min = (int)$attrs['min'];
            $max = (int)$attrs['max'];
            $width = (float)$attrs['width'];
            $points = (($width * 7) + 5) * 0.75;

            for ($i = $min; $i <= $max; $i++) {
                $colWidths[$i] = $points;
            }
        }

        $rowHeights = array_fill(1, $maxRow, 12.75);
        foreach ($sheet->xpath('//x:sheetData/x:row') as $row) {
            $attrs = $row->attributes();
            $rowIndex = (int)$attrs['r'];
            if (isset($attrs['ht'])) {
                $rowHeights[$rowIndex] = (float)$attrs['ht'];
            }
        }

        $colOffsets = [1 => 0.0];
        for ($i = 2; $i <= $maxColumn + 1; $i++) {
            $colOffsets[$i] = $colOffsets[$i - 1] + ($colWidths[$i - 1] ?? 48);
        }

        $rowOffsets = [1 => 0.0];
        for ($i = 2; $i <= $maxRow + 1; $i++) {
            $rowOffsets[$i] = $rowOffsets[$i - 1] + ($rowHeights[$i - 1] ?? 12.75);
        }

        $sheetWidth = $colOffsets[$maxColumn + 1];
        $sheetHeight = $rowOffsets[$maxRow + 1];
        $pageWidth = 595.0;
        $pageHeight = 842.0;
        $margin = 18.0;
        $scale = min(($pageWidth - ($margin * 2)) / $sheetWidth, ($pageHeight - ($margin * 2)) / $sheetHeight);
        $xOffset = ($pageWidth - ($sheetWidth * $scale)) / 2;
        $yOffset = ($pageHeight - ($sheetHeight * $scale)) / 2;

        $cellRect = function ($cell, $endCell = null) use ($splitCell, $colOffsets, $rowOffsets, $colWidths, $rowHeights, $scale, $xOffset, $yOffset, $pageHeight) {
            $start = $splitCell($cell);
            $end = $endCell ? $splitCell($endCell) : $start;
            $x = $xOffset + ($colOffsets[$start['col']] * $scale);
            $top = $yOffset + ($rowOffsets[$start['row']] * $scale);
            $width = (($colOffsets[$end['col']] - $colOffsets[$start['col']]) + ($colWidths[$end['col']] ?? 48)) * $scale;
            $height = (($rowOffsets[$end['row']] - $rowOffsets[$start['row']]) + ($rowHeights[$end['row']] ?? 12.75)) * $scale;

            return [
                'x' => $x,
                'y' => $pageHeight - $top - $height,
                'w' => $width,
                'h' => $height,
                'top' => $top,
            ];
        };

        $content = "q\n";
        $coveredCells = [];
        $mergedRanges = [];
        $mergedCellEndRefs = [];

        foreach ($sheet->xpath('//x:mergeCells/x:mergeCell') as $mergeCell) {
            $attrs = $mergeCell->attributes();
            $range = strtoupper((string)$attrs['ref']);
            if (!preg_match('/^([A-Z]+\d+):([A-Z]+\d+)$/', $range, $matches)) {
                continue;
            }

            $start = $splitCell($matches[1]);
            $end = $splitCell($matches[2]);
            if ($start['col'] > $maxColumn || $start['row'] > $maxRow) {
                continue;
            }
            if ($end['col'] > $maxColumn || $end['row'] > $maxRow) {
                continue;
            }
            $mergedRanges[] = [$matches[1], $matches[2]];
            $mergedCellEndRefs[$matches[1]] = $matches[2];

            for ($row = $start['row']; $row <= $end['row']; $row++) {
                for ($col = $start['col']; $col <= $end['col']; $col++) {
                    $coveredCells[$col . ':' . $row] = true;
                }
            }
        }

        $columnNumberToName = function ($col) {
            $columnName = '';
            $number = $col;
            while ($number > 0) {
                $number--;
                $columnName = chr(65 + ($number % 26)) . $columnName;
                $number = intdiv($number, 26);
            }
            return $columnName;
        };
        $textCellRect = function ($cell) use ($cellRect, $mergedCellEndRefs) {
            $cell = strtoupper($cell);
            return $cellRect($cell, $mergedCellEndRefs[$cell] ?? null);
        };
        $drawBorderLine = function ($x1, $y1, $x2, $y2, $border) use (&$content) {
            if (!$border || empty($border['style'])) {
                return;
            }
            $hex = $border['color'] ?? '000000';
            $red = hexdec(substr($hex, 0, 2)) / 255;
            $green = hexdec(substr($hex, 2, 2)) / 255;
            $blue = hexdec(substr($hex, 4, 2)) / 255;
            $width = in_array($border['style'], ['medium', 'thick'], true) ? 0.7 : 0.35;
            $content .= sprintf("%.3F %.3F %.3F RG %.2F w %.2F %.2F m %.2F %.2F l S\n", $red, $green, $blue, $width, $x1, $y1, $x2, $y2);
        };

        for ($row = 1; $row <= $maxRow; $row++) {
            for ($col = 1; $col <= $maxColumn; $col++) {
                $columnName = '';
                $columnName = $columnNumberToName($col);
                $cellRef = $columnName . $row;
                $border = $borderForCell($cellRef);
                if (!$border['left'] && !$border['right'] && !$border['top'] && !$border['bottom']) {
                    continue;
                }
                $rect = $cellRect($cellRef);
                $drawBorderLine($rect['x'], $rect['y'], $rect['x'], $rect['y'] + $rect['h'], $border['left']);
                $drawBorderLine($rect['x'] + $rect['w'], $rect['y'], $rect['x'] + $rect['w'], $rect['y'] + $rect['h'], $border['right']);
                $drawBorderLine($rect['x'], $rect['y'] + $rect['h'], $rect['x'] + $rect['w'], $rect['y'] + $rect['h'], $border['top']);
                $drawBorderLine($rect['x'], $rect['y'], $rect['x'] + $rect['w'], $rect['y'], $border['bottom']);
            }
        }

        $imageObjects = [];
        $nextImageObject = 6;
        $addImage = function ($name, $binary, $rect, $fit = 'stretch') use (&$content, &$imageObjects, &$nextImageObject) {
            if (!$binary || !function_exists('imagecreatefromstring')) return;

            $image = @imagecreatefromstring($binary);
            if (!$image) return;

            $width = imagesx($image);
            $height = imagesy($image);
            ob_start();
            imagejpeg($image, null, 88);
            $jpeg = ob_get_clean();
            imagedestroy($image);

            $imageObjects[$name] = [
                'number' => $nextImageObject++,
                'width' => $width,
                'height' => $height,
                'data' => $jpeg,
            ];
            $draw = $rect;
            if ($fit === 'contain' && $width > 0 && $height > 0) {
                $ratio = min($rect['w'] / $width, $rect['h'] / $height);
                $draw['w'] = $width * $ratio;
                $draw['h'] = $height * $ratio;
                $draw['x'] = $rect['x'] + (($rect['w'] - $draw['w']) / 2);
                $draw['y'] = $rect['y'] + (($rect['h'] - $draw['h']) / 2);
            }
            $content .= sprintf("q %.2F 0 0 %.2F %.2F %.2F cm /%s Do Q\n", $draw['w'], $draw['h'], $draw['x'], $draw['y'], $name);
        };

        $addImage('TemplateLogo', $logoImage, $cellRect('C3', 'G5'), 'contain');
        if ($photoPath && file_exists($photoPath)) {
            $addImage('CandidatePhoto', file_get_contents($photoPath), $cellRect('AD7', 'AQ30'));
        }

        $content .= "BT\n/F1 6 Tf\n0 0 0 rg\n";
        $addText = function ($cell, $text, $style = []) use (&$content, &$imageObjects, &$nextImageObject, $textCellRect, $pdfSafeText, $unicodeFontRegular, $unicodeFontBold) {
            $rect = $textCellRect($cell);
            $size = $style['size'] ?? 6;
            $font = $style['font'] ?? 'F1';
            $hex = $style['color'] ?? '000000';
            $red = hexdec(substr($hex, 0, 2)) / 255;
            $green = hexdec(substr($hex, 2, 2)) / 255;
            $blue = hexdec(substr($hex, 4, 2)) / 255;
            if (preg_match('/\p{Han}/u', (string)$text) && function_exists('imagettftext') && file_exists($unicodeFontRegular)) {
                $scale = 4;
                $fontPath = $font === 'F2' && file_exists($unicodeFontBold) ? $unicodeFontBold : $unicodeFontRegular;
                $fontPixels = max(8, (int)round(min($size * $scale, max(4, $rect['h'] - 2) * $scale * 0.82)));
                $bbox = imagettfbbox($fontPixels, 0, $fontPath, (string)$text);
                if ($bbox !== false) {
                    $minX = min($bbox[0], $bbox[6]);
                    $maxX = max($bbox[2], $bbox[4]);
                    $minY = min($bbox[5], $bbox[7]);
                    $maxY = max($bbox[1], $bbox[3]);
                    $textPixelWidth = $maxX - $minX;
                    $textPixelHeight = $maxY - $minY;
                    $drawW = min(max(1, $rect['w'] - 4), max(1, ($textPixelWidth / $scale) + 3));
                    $drawH = min(max(1, $rect['h'] - 2), max(1, ($textPixelHeight / $scale) + 3));
                    $imgW = max(1, (int)ceil($drawW * $scale));
                    $imgH = max(1, (int)ceil($drawH * $scale));
                    $image = imagecreatetruecolor($imgW, $imgH);
                    $background = imagecolorallocate($image, 255, 255, 255);
                    imagefilledrectangle($image, 0, 0, $imgW, $imgH, $background);
                    $textColor = imagecolorallocate(
                        $image,
                        (int)round($red * 255),
                        (int)round($green * 255),
                        (int)round($blue * 255)
                    );
                    $baseline = min($imgH - 1, max(1, 1 - $minY));
                    imagettftext($image, $fontPixels, 0, 1 - $minX, $baseline, $textColor, $fontPath, (string)$text);
                    ob_start();
                    imagejpeg($image, null, 92);
                    $jpeg = ob_get_clean();
                    imagedestroy($image);

                    if ($jpeg !== false) {
                        $x = $rect['x'] + 2;
                        if (($style['horizontal'] ?? null) === 'center') {
                            $x = $rect['x'] + max(2, (($rect['w'] - $drawW) / 2));
                        } elseif (($style['horizontal'] ?? null) === 'right') {
                            $x = $rect['x'] + max(2, $rect['w'] - $drawW - 2);
                        }
                        $y = $rect['y'] + max(1, ($rect['h'] - $drawH) / 2);
                        $name = 'TextImage' . $nextImageObject;
                        $imageObjects[$name] = [
                            'number' => $nextImageObject++,
                            'width' => $imgW,
                            'height' => $imgH,
                            'data' => $jpeg,
                        ];
                        $content .= sprintf("ET\nq %.2F 0 0 %.2F %.2F %.2F cm /%s Do Q\nBT\n", $drawW, $drawH, $x, $y, $name);
                        return;
                    }
                }
            }
            $safeText = $pdfSafeText($text);
            $textWidth = strlen((string)$text) * $size * 0.42;
            $x = $rect['x'] + 2;
            if (($style['horizontal'] ?? null) === 'center') {
                $x = $rect['x'] + max(2, (($rect['w'] - $textWidth) / 2));
            } elseif (($style['horizontal'] ?? null) === 'right') {
                $x = $rect['x'] + max(2, $rect['w'] - $textWidth - 2);
            }
            $y = $rect['y'] + max(3, ($rect['h'] / 2) - ($size / 2));
            $content .= sprintf("%.3F %.3F %.3F rg 1 0 0 1 %.2F %.2F Tm /%s %.2F Tf (%s) Tj\n", $red, $green, $blue, $x, $y, $font, $size, $safeText);
        };

        foreach ($sheet->xpath('//x:sheetData/x:row/x:c') as $cellNode) {
            $attrs = $cellNode->attributes();
            $cellRef = (string)$attrs['r'];
            $cellPosition = $splitCell($cellRef);
            if ($cellPosition['col'] > $maxColumn || $cellPosition['row'] > $maxRow) {
                continue;
            }
            $text = '';

            if (array_key_exists($cellRef, $cellMap)) {
                continue;
            } elseif ((string)$attrs['t'] === 's' && isset($cellNode->v)) {
                $text = $sharedStrings[(int)$cellNode->v] ?? '';
            } elseif (isset($cellNode->v)) {
                $text = (string)$cellNode->v;
            }

            if (trim((string)$text) === '') continue;

            $addText($cellRef, $text, $styleForCell($cellRef));
        }
        foreach ($cellMap as $cellRef => $text) {
            if (trim((string)$text) === '') continue;

            $style = $styleForCell($cellRef);
            if (in_array($cellRef, ['K20', 'K21', 'K22', 'K23', 'K24', 'V24'], true)) {
                $style['size'] = max($style['size'], 7);
            }
            $addText($cellRef, $text, $style);
        }
        $content .= "ET\nQ\n";

        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            3 => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >>',
            4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
        ];

        if ($imageObjects) {
            $xObjects = [];
            foreach ($imageObjects as $name => $image) {
                $xObjects[] = '/' . $name . ' ' . $image['number'] . ' 0 R';
            }
            $objects[3] .= ' /XObject << ' . implode(' ', $xObjects) . ' >>';
        }
        $objects[3] = str_replace('/Font << /F1 4 0 R >>', '/Font << /F1 4 0 R /F2 5 0 R >>', $objects[3]);
        $objects[3] .= ' >> /Contents 6 0 R >>';

        $contentObjectNumber = $imageObjects ? (max(array_column($imageObjects, 'number')) + 1) : 6;
        $objects[3] = preg_replace('/\/Contents\s+6\s+0\s+R/', '/Contents ' . $contentObjectNumber . ' 0 R', $objects[3]);

        foreach ($imageObjects as $image) {
            $objects[$image['number']] = "<< /Type /XObject /Subtype /Image /Width {$image['width']} /Height {$image['height']} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " . strlen($image['data']) . " >>\nstream\n" . $image['data'] . "\nendstream";
        }
        $objects[$contentObjectNumber] = '<< /Length ' . strlen($content) . " >>\nstream\n" . $content . "endstream";

        ksort($objects);
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $number => $object) {
            $offsets[$number] = strlen($pdf);
            $pdf .= "$number 0 obj\n$object\nendobj\n";
        }

        $xref = strlen($pdf);
        $maxObject = max(array_keys($objects));
        $pdf .= "xref\n0 " . ($maxObject + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= $maxObject; $i++) {
            $pdf .= isset($offsets[$i])
                ? sprintf("%010d 00000 n \n", $offsets[$i])
                : "0000000000 65535 f \n";
        }
        $pdf .= "trailer\n<< /Size " . ($maxObject + 1) . " /Root 1 0 R >>\nstartxref\n$xref\n%%EOF";

        return $pdf;
    };

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
    Flight::route('POST /', function () use ($pdo, $normalizeDate) {
        
        $body = Flight::request()->data;
        $experience = isset($body->experience)
            ? preg_replace('/\D+/', '', (string)$body->experience)
            : null;
        $experience = $experience === '' ? null : $experience;
        $workExperience = isset($body->work_experience)
            ? json_encode($body->work_experience, JSON_UNESCAPED_UNICODE)
            : null;

        $stmt = $pdo->prepare("
            INSERT INTO applicant 
            (name, category_id, reference_no, register_date, birth_date, age, religion, home_address, place_of_birth, phone, sex, weight, height, marital_status, last_education, husband_name, husband_age, husband_occupation, number_of_children, children_age, number_of_brother, brother_age, number_of_sister, sister_age, father_name, father_age, father_occupation, mother_name, mother_age, mother_occupation, family_rank, work_experience, experience, job_description, from_date, to_date, keterangan, candidate_status, reserved, passport_note, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
                $body->name,
                $body->category_id,
                $body->reference_no ?? null,
                $normalizeDate($body->register_date ?? null),
                $normalizeDate($body->birth_date ?? null),
                isset($body->age) ? (int)$body->age : null,
                $body->religion ?? null,
                $body->home_address ?? null,
                $body->place_of_birth ?? null,
                $body->phone ?? null,
                $body->sex ?? null,
                    isset($body->weight) ? (int)$body->weight : null,
                    isset($body->height) ? (int)$body->height : null,
                    $body->marital_status ?? null,
                    $body->last_education ?? null,
                    $body->husband_name ?? null,
                    isset($body->husband_age) && $body->husband_age !== '' ? (int)$body->husband_age : null,
                    $body->husband_occupation ?? null,
                    isset($body->number_of_children) && $body->number_of_children !== '' ? (int)$body->number_of_children : null,
                    $body->children_age ?? null,
                    isset($body->number_of_brother) && $body->number_of_brother !== '' ? (int)$body->number_of_brother : null,
                    $body->brother_age ?? null,
                    isset($body->number_of_sister) && $body->number_of_sister !== '' ? (int)$body->number_of_sister : null,
                    $body->sister_age ?? null,
                    $body->father_name ?? null,
                    isset($body->father_age) && $body->father_age !== '' ? (int)$body->father_age : null,
                    $body->father_occupation ?? null,
                    $body->mother_name ?? null,
                    isset($body->mother_age) && $body->mother_age !== '' ? (int)$body->mother_age : null,
                    $body->mother_occupation ?? null,
                    $body->family_rank ?? null,
                    $workExperience,
                    $experience,
                    $body->job_description ?? null,
                    $normalizeDate($body->from_date ?? null),
                    $normalizeDate($body->to_date ?? null),
                    $body->keterangan ?? null,
                    $body->candidate_status ?? 'Available for Application',
                    $body->reserved ?? 'Not Available',
                    $body->passport_note ?? null,
                $body->created_by ?? null
        ]);

        Flight::json([
            'message' => 'Applicant created',
            'id' => $pdo->lastInsertId()
        ], 201);
    });

    /**
     * =========================
     * UPDATE KETERANGAN ONLY
     * =========================
     * PATCH /applicant/:id/keterangan
     */
    Flight::route('PATCH /@id/keterangan', function ($id) use ($pdo) {
        $body = Flight::request()->data;
        $keterangan = isset($body->keterangan)
            ? strtoupper((string)$body->keterangan)
            : null;

        $stmt = $pdo->prepare("
            UPDATE applicant SET
                keterangan = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $keterangan,
            $id
        ]);

        if ($stmt->rowCount() === 0) {
            $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM applicant WHERE id = ?");
            $checkStmt->execute([$id]);

            if ((int)$checkStmt->fetchColumn() === 0) {
                Flight::halt(404, 'Applicant not found');
            }
        }

        Flight::json(['message' => 'Keterangan updated']);
    });

    /**
     * =========================
     * UPDATE
     * =========================
     * PUT /applicant/:id
     */
    Flight::route('PUT /@id', function ($id) use ($pdo, $normalizeDate) {
        
        $body = Flight::request()->data;
        $experience = isset($body->experience)
            ? preg_replace('/\D+/', '', (string)$body->experience)
            : null;
        $experience = $experience === '' ? null : $experience;
        $workExperience = isset($body->work_experience)
            ? json_encode($body->work_experience, JSON_UNESCAPED_UNICODE)
            : null;

        $stmt = $pdo->prepare("
            UPDATE applicant SET
                name = ?,
                category_id = ?,
                reference_no = ?,
                register_date = ?,
                birth_date = ?,
                age = ?,
                religion = ?,
                home_address = ?,
                place_of_birth = ?,
                phone = ?,
                sex = ?,
                weight = ?,
                height = ?,
                marital_status = ?,
                last_education = ?,
                husband_name = ?,
                husband_age = ?,
                husband_occupation = ?,
                number_of_children = ?,
                children_age = ?,
                number_of_brother = ?,
                brother_age = ?,
                number_of_sister = ?,
                sister_age = ?,
                father_name = ?,
                father_age = ?,
                father_occupation = ?,
                mother_name = ?,
                mother_age = ?,
                mother_occupation = ?,
                family_rank = ?,
                work_experience = ?,
                experience = ?,
                job_description = ?,
                from_date = ?,
                to_date = ?,
                keterangan = ?,
                candidate_status = ?,
                reserved = ?,
                passport_note = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $body->name,
            $body->category_id,
            $body->reference_no ?? null,
            $normalizeDate($body->register_date ?? null),
            $normalizeDate($body->birth_date ?? null),
            isset($body->age) ? (int)$body->age : null,
            $body->religion ?? null,
            $body->home_address ?? null,
            $body->place_of_birth ?? null,
            $body->phone ?? null,
            $body->sex ?? null,
            isset($body->weight) ? (int)$body->weight : null,
            isset($body->height) ? (int)$body->height : null,
            $body->marital_status ?? null,
            $body->last_education ?? null,
            $body->husband_name ?? null,
            isset($body->husband_age) && $body->husband_age !== '' ? (int)$body->husband_age : null,
            $body->husband_occupation ?? null,
            isset($body->number_of_children) && $body->number_of_children !== '' ? (int)$body->number_of_children : null,
            $body->children_age ?? null,
            isset($body->number_of_brother) && $body->number_of_brother !== '' ? (int)$body->number_of_brother : null,
            $body->brother_age ?? null,
            isset($body->number_of_sister) && $body->number_of_sister !== '' ? (int)$body->number_of_sister : null,
            $body->sister_age ?? null,
            $body->father_name ?? null,
            isset($body->father_age) && $body->father_age !== '' ? (int)$body->father_age : null,
            $body->father_occupation ?? null,
            $body->mother_name ?? null,
            isset($body->mother_age) && $body->mother_age !== '' ? (int)$body->mother_age : null,
            $body->mother_occupation ?? null,
            $body->family_rank ?? null,
            $workExperience,
            $experience,
            $body->job_description ?? null,
            $normalizeDate($body->from_date ?? null),
            $normalizeDate($body->to_date ?? null),
            $body->keterangan ?? null,
            $body->candidate_status ?? 'Available for Application',
            $body->reserved ?? 'Not Available',
            $body->passport_note ?? null,
            $id
        ]);

        if ($stmt->rowCount() === 0) {
            Flight::halt(404, 'Applicant not found');
        }

        Flight::json(['message' => 'Applicant updated']);
    });

    /**
     * =========================
     * PUBLISH GENERATED CV PDF
     * =========================
     * POST /applicant/:id/publish-cv
     */
    Flight::route('POST /@id/publish-cv', function ($id) use ($pdo, $buildXlsxTemplateCandidateWorkbook, $buildXlsxTemplateCandidatePdf, $convertXlsxToPdf, $convertXlsxToPdfWithApi, $resolveCvTemplatePath) {
        if (!$resolveCvTemplatePath()) {
            Flight::halt(500, 'CV template not found');
        }

        $stmt = $pdo->prepare("SELECT * FROM applicant WHERE id = ?");
        $stmt->execute([$id]);
        $candidate = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$candidate) {
            Flight::halt(404, 'Applicant not found');
        }

        $hasValue = function ($value) {
            return trim((string)($value ?? '')) !== '';
        };
        $requiredFields = [
            'name' => 'Name',
            'age' => 'Age',
            'last_education' => 'Attainment',
            'marital_status' => 'Marital Status',
            'sex' => 'Sex',
            'home_address' => 'Home Address',
            'birth_date' => 'Date of Birth',
            'place_of_birth' => 'Place of Birth',
            'weight' => 'Weight',
            'height' => 'Height',
            'phone' => 'Phone Number',
            'father_name' => "Father's Name",
            'father_age' => "Father's Age",
            'father_occupation' => "Father's Occupation",
            'mother_name' => "Mother's Name",
            'mother_age' => "Mother's Age",
            'mother_occupation' => "Mother's Occupation",
            'family_rank' => 'In the Family, I am No',
        ];
        $missingFields = [];
        foreach ($requiredFields as $field => $label) {
            if (!$hasValue($candidate[$field] ?? null)) {
                $missingFields[] = $label;
            }
        }

        $workExperiences = [];
        if (!empty($candidate['work_experience'])) {
            $decoded = json_decode($candidate['work_experience'], true);
            $workExperiences = is_array($decoded) ? $decoded : [];
        }
        foreach ([0, 1] as $index) {
            $experienceNumber = $index + 1;
            $experience = $workExperiences[$index] ?? [];
            $experienceHasAnyValue = false;
            foreach (['from', 'to', 'employerName', 'address', 'numberOfFamily', 'adult', 'children', 'reasonOfLeave', 'remarks', 'strongPoints'] as $field) {
                if ($hasValue($experience[$field] ?? null)) {
                    $experienceHasAnyValue = true;
                    break;
                }
            }
            foreach (($experience['activities'] ?? []) as $activity) {
                if (!empty($activity['checked']) || $hasValue($activity['detail'] ?? null)) {
                    $experienceHasAnyValue = true;
                    break;
                }
            }
            if ($index > 0 && !$experienceHasAnyValue) {
                continue;
            }

            foreach ([
                'from' => 'From',
                'to' => 'To',
                'employerName' => 'Name of Employer',
                'address' => 'Address',
                'numberOfFamily' => 'Number of Family',
                'adult' => 'Adult',
                'children' => 'Children',
                'reasonOfLeave' => 'Reason of Leave',
                'remarks' => 'Remarks',
                'strongPoints' => 'Description Strong Points',
            ] as $field => $label) {
                if (!$hasValue($experience[$field] ?? null)) {
                    $missingFields[] = "Experience $experienceNumber - $label";
                }
            }
            $hasActivity = false;
            foreach (($experience['activities'] ?? []) as $activity) {
                if (!empty($activity['checked'])) {
                    $hasActivity = true;
                    break;
                }
            }
            if (!$hasActivity) {
                $missingFields[] = "Experience $experienceNumber - Working Activity";
            }
        }

        $storage = Flight::get('storage_path');
        $type = 'cv';
        $dir = "$storage/$id/$type";
        ensureDir($dir);

        $safeName = preg_replace('/[^A-Za-z0-9_-]+/', '_', strtoupper((string)$candidate['name']));
        $baseFilename = 'published_cv_' . $id . '_' . date('YmdHis') . '_' . trim($safeName, '_');
        $filename = $baseFilename . '.pdf';
        $path = "$dir/$filename";
        $xlsxPath = "$dir/$baseFilename.xlsx";
        $relativePath = str_replace($storage, '', $path);
        $photoPath = null;

        $photoStmt = $pdo->prepare("
            SELECT file_path
            FROM document
            WHERE applicant_id = ? AND type = 'photo'
            LIMIT 1
        ");
        $photoStmt->execute([$id]);
        $photo = $photoStmt->fetch(PDO::FETCH_ASSOC);

        if ($photo && !empty($photo['file_path'])) {
            $candidatePhotoPath = $storage . $photo['file_path'];
            if (file_exists($candidatePhotoPath)) {
                $photoPath = $candidatePhotoPath;
            }
        }

        if (!$photoPath) {
            $missingFields[] = 'Photo';
        }

        if ($missingFields) {
            Flight::json([
                'message' => 'Complete required data before publish: ' . implode(', ', $missingFields),
                'missing_fields' => $missingFields,
            ], 422);
            return;
        }

        $pdo->beginTransaction();

        try {
            file_put_contents($xlsxPath, $buildXlsxTemplateCandidateWorkbook($candidate, $photoPath));
            $publishedPath = $path;
            $publishedRelativePath = $relativePath;
            $publishedFormat = 'pdf';

            try {
                $convertXlsxToPdf($xlsxPath, $path);
            } catch (Throwable $converterError) {
                error_log('LibreOffice conversion failed for applicant ' . $id . ': ' . $converterError->getMessage());
                try {
                    $convertXlsxToPdfWithApi($xlsxPath, $path);
                } catch (Throwable $apiConverterError) {
                    error_log('ConvertAPI conversion failed for applicant ' . $id . ': ' . $apiConverterError->getMessage());
                    $publishedPath = $xlsxPath;
                    $publishedRelativePath = str_replace($storage, '', $xlsxPath);
                    $publishedFormat = 'xlsx';
                }
            }

            $existingStmt = $pdo->prepare("
                SELECT id, file_path
                FROM document
                WHERE applicant_id = ? AND type = ?
                LIMIT 1
            ");
            $existingStmt->execute([$id, $type]);
            $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                deleteFile($storage . $existing['file_path']);
                $update = $pdo->prepare("
                    UPDATE document
                    SET file_path = ?, created_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $update->execute([$publishedRelativePath, $existing['id']]);
                $documentId = $existing['id'];
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO document (applicant_id, type, file_path)
                    VALUES (?, ?, ?)
                ");
                $insert->execute([$id, $type, $publishedRelativePath]);
                $documentId = $pdo->lastInsertId();
            }

            $pdo->commit();

            if ($publishedPath === $path) {
                deleteFile($xlsxPath);
            } else {
                deleteFile($path);
            }

            Flight::json([
                'message' => 'Candidate CV published',
                'id' => $documentId,
                'file_path' => $publishedRelativePath,
                'format' => $publishedFormat,
            ], 201);
        } catch (Throwable $e) {
            $pdo->rollBack();
            deleteFile($path);
            deleteFile($xlsxPath);
            error_log('Publish CV failed for applicant ' . $id . ': ' . $e->getMessage());
            Flight::json(['message' => $e->getMessage()], 500);
        }
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
