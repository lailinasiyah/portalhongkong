<?php

namespace app\middleware;

use Flight;

class AuthMiddleware
{
    public static function handle()
    {
        // if (!isset($_SESSION['user'])) {
        //     Flight::json([
        //         'status' => false,
        //         'message' => 'Unauthorized'
        //     ], 401);
        //     exit;
        // }
    }
}
