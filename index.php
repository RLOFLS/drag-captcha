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
use Rlofls\DragCaptcha\Resources;

require_once (__DIR__ . '/vendor/autoload.php');

session_start();
$url = $_SERVER['REQUEST_URI'];
$path = parse_url($url, PHP_URL_PATH);

//Add custom background image
Resources::$customBg = [
    __DIR__ . '/customBg/1.png',
    __DIR__ . '/customBg/2.png',
    __DIR__ . '/customBg/3.png',
    __DIR__ . '/customBg/4.png',
    __DIR__ . '/customBg/5.png',
    __DIR__ . '/customBg/6.png',
];

switch ($path) {
    case '/dragData':
        $drag = new Drag();
        [$dst, $font] = $drag->generate(true);

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
        if ($dst && Drag::verify($dst, $mask)) {
            $res = json_encode(['code' => 1]);
        } else {
            unset($_SESSION['drag-dst']);
        }
        header('Content-Type:application/json');
        echo $res;
        break;
    default:
        include (__DIR__ . '/index.html');
}
