<?php
declare(strict_types=1);

/**
 * This file is part of drag-captcha.
 *
 * Licensed under The MIT License
 *
 * @author rlofls
 */
namespace Rlofls\DragCaptcha;

/**
 * Class Drag
 * @package Rlofls\DragCaptcha
 * date 2022/7/11
 */
class Drag
{

    public const BASE64_HEADER = 'data:image/png;base64,';

    /**
     * @var int drag image bg width
     */
    private $bgWidth = 250;

    /**
     * @var int  drag image bg height
     */
    private $bgHeight = 160;

    /**
     * @var int drag image mask width/height
     */
    private $maskWH = 60;

    /**
     * @throws \Exception
     */
    public function generate(bool $useConfuse = false): array
    {
        $bgPath = Resources::bg();
        $mask = Resources::mask();

        $imgBG = imagecreatefrompng($bgPath);
        $imgDst = imagecreatetruecolor($this->bgWidth, $this->bgHeight);
        $imgMask = imagecreatefrompng($mask['img']);

        imagesavealpha($imgMask, true);
        imagesavealpha($imgDst, true);

        imagecopyresized($imgDst, $imgBG, 0, 0, 0,0, $this->bgWidth, $this->bgHeight, imagesx($imgBG), imagesy($imgBG));

        [$dstPosition, $maskPosition] = $this->getPosition();

        $maker = new Maker($useConfuse);
        $maker->swapPixels($dstPosition, $mask, $imgDst, $imgMask);

        ob_start();
        imagepng($imgDst);
        imagedestroy($imgDst);
        $bgData = ob_get_contents();
        ob_end_clean();

        ob_start();
        imagepng($imgMask);
        imagedestroy($imgMask);
        $maskData = ob_get_contents();
        ob_end_clean();
        imagedestroy($imgBG);

        return [
            $dstPosition,
            [
                'bgBase64' => self::BASE64_HEADER . base64_encode($bgData),
                'bgW' => $this->bgWidth,
                'bgH' => $this->bgHeight,
                'maskBase64' => self::BASE64_HEADER . base64_encode($maskData),
                'maskPath' => $mask['path'],
                'maskLeft' => $maskPosition['left'],
                'maskTop' => $maskPosition['top'],
                'maskViewBox' =>  $mask['viewBox'],
                //Better mask drag to target location display
                'maskWH' => $this->maskWH - 3,

            ]
        ];
    }

    /**
     * Calculate the position, drag the target $dst, and drag the initial position of the mask, Temporary random
     * @return array[]
     */
    private function getPosition(): array
    {
        $dst = [
            'left' => rand( 0, $this->bgWidth - $this->maskWH),
            'top' => rand( 0, $this->bgHeight - $this->maskWH),
        ];

        $mask = [
            'left' => rand( 0, $this->bgWidth - $this->maskWH),
            'top' => rand( 0, $this->bgHeight - $this->maskWH),
        ];

        return [$dst, $mask];
    }

    /**
     * @param array $dst  ['left' => 160, 'top' => 50]
     * @param array $mask  ['left' => 162, 'top' => 51]
     * @param int $offset 3 verify offset default
     * @return bool
     */
    public static function verify(array $dst, array $mask, int $offset = 3): bool
    {
        if (! isset($mask['left'], $mask['top'])) {
            return false;
        }
        $answerLeft = $dst['left'];
        $answerTop = $dst['top'];

        $dataLeft = (int)$mask['left'];
        $dataTop = (int)$mask['top'];

        if (abs($answerLeft - $dataLeft) < $offset && abs($answerTop - $dataTop) < $offset) {
            return true;
        }

        return  false;
    }
}