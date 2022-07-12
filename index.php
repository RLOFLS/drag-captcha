<?php
declare(strict_types = 1);
/**
 * This file is part of drag-captcha.
 *
 * Licensed under The MIT License
 *
 * @author rlofls
 */
use Rlofls\DragCaptcha\Drag;

require_once (__DIR__ . '/vendor/autoload.php');

session_start();
$url = $_SERVER['REQUEST_URI'];
$path = parse_url($url, PHP_URL_PATH);

switch ($path) {
    case '/dragData':
        $drag = new Drag();
        [$dst, $font] = $drag->generate();

        //cache target value
        $_SESSION['drag-dst'] = json_encode($dst);

        header('Content-Type:application/json');
        echo json_encode($font);
        break;
    case '/dragVerify':
        $post = json_decode(file_get_contents('php://input'), true);
        $mask = $post['mask'] ?? [];

        $dst = json_decode($_SESSION['drag-dst'], true);

        $res = json_encode(['code' => 0]);
        if (Drag::verify($dst, $mask)) {
            $res = json_encode(['code' => 1]);
        }
        header('Content-Type:application/json');
        echo $res;
        break;
    default:
        include (__DIR__ . '/index.html');
}
