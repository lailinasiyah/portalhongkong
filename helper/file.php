<?php

function ensureDir(string $path)
{
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
}

function deleteFile(?string $path)
{
    if ($path && file_exists($path)) {
        unlink($path);
    }
}
