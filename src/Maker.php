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

use Rlofls\DragCaptcha\Confuse\ConfuseCut;
use Rlofls\DragCaptcha\Confuse\ConfuseExpand;
use Rlofls\DragCaptcha\Confuse\ConfuseInterface;

class Maker
{

    private $useConfuse;

    private $confuseClass = [
        ConfuseCut::class,
        ConfuseExpand::class,
    ];

    public function __construct(bool $useConfuse = false) {
        $this->useConfuse = $useConfuse;
    }

    /**
     * @param $dst
     * @param $mask
     * @param $imgDst
     * @param $imgMask
     * @throws \Exception
     */
    public function swapPixels($dst, $mask, $imgDst, $imgMask): void
    {
        if ($this->useConfuse) {
            $this->confuse($dst, $mask, $imgDst, $imgMask)->swapPixels();
            return;
        }
        //normal
        Utils::swapAndDeepMask($imgDst, $imgMask, $dst, function ($x, $y, $tx, $ty, $tRgb) use ($imgMask, $imgDst) {
            $color = imagecolorallocate($imgMask, $tRgb['red'], $tRgb['green'], $tRgb['blue']);
            imagesetpixel($imgMask, $x, $y, $color);

            $tColor = Utils::deepColor($imgDst, $tRgb);
            imagesetpixel($imgDst, $tx, $ty, $tColor);
        });
    }

    /**
     * @param $dstPosition
     * @param $mask
     * @param $imgDst
     * @param $imgMask
     * @return ConfuseInterface
     * @throws \Exception
     */
    private function confuse($dstPosition, $mask, $imgDst, $imgMask): ConfuseInterface
    {
        $class = Utils::randValue($this->confuseClass);
        return new $class($dstPosition, $mask, $imgDst, $imgMask);
    }
}