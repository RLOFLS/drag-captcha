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

require_once(__DIR__ . '/vendor/autoload.php');

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
        [$dst, $data] = $drag->generate(true);

        //cache target value

        //Create a verification unique ID, user cache, and subsequent verification
        $cid = uniqid('drag-captcha');
        $_SESSION[$cid] = json_encode($dst);
        $data['cid'] = $cid;

        header('Content-Type:application/json');
        echo json_encode(['status' => 'success', 'data'=> $data]);
        break;
    case '/dragVerify':
        $post = json_decode(file_get_contents('php://input'), true);
        $cid = $post['cid'] ?? '';
        $mask = $post['mask'] ?? [];

        $dst = json_decode($_SESSION[$cid], true);

        $res = json_encode(['status' => 'error']);
        if ($dst && Drag::verify($dst, $mask)) {
            $res = json_encode(['status' => 'success']);
        }
        unset($_SESSION[$cid]);
        header('Content-Type:application/json');
        echo $res;
        break;
    default:
        include(__DIR__ . '/index.html');
}
