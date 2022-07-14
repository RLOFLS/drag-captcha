<?php
declare(strict_types=1);
/**
 * This file is part of drag-captcha.
 *
 * Licensed under The MIT License
 *
 * @author rlofls
 */
namespace Rlofls\DragCaptcha\Confuse;

use Rlofls\DragCaptcha\Utils;

/**
 * cut graphics
 * Class ConfuseCut
 * @package Rlofls\DragCaptcha\Confuse
 */
class ConfuseCut implements ConfuseInterface
{
    private $dst;
    private $mask;
    private $imgMask;
    private $imgDst;

    /**
     * @var false|int
     */
    private $maskWH;

    public const DIR_LT = 'LT';
    public const DIR_TR = 'TR';
    public const DIR_RB = 'RB';
    public const DIR_BL = 'BL';
    public const DIR_TB = 'TB';
    public const DIR_LR = 'LR';

    public const DIR_ARR = [
        self::DIR_LT,
        self::DIR_TR,
        self::DIR_RB,
        self::DIR_BL,
        self::DIR_TB,
        self::DIR_LR,
    ];

    private $cutPoint;
    private $curDir;
    private $bleA = 0;
    private $bleB = 0;

    /**
     * @throws \Exception
     */
    public function __construct($dst, $mask, $imgDst, $imgMask)
    {
        $this->dst = $dst;
        $this->mask = $mask;
        $this->imgMask = $imgMask;
        $this->imgDst = $imgDst;

        $this->maskWH = imagesx($imgMask);

        $this->initCutPoint();
        $this->initCurDir();
        $this->initBLEAB();
    }

    /**
     * @inheritDoc
     */
    public function swapPixels(): void
    {
        Utils::swapAndDeepMask($this->imgDst, $this->imgMask, $this->dst, function ($x, $y, $tx, $ty, $tRgb) {

            $color = imagecolorallocate($this->imgMask, $tRgb['red'], $tRgb['green'], $tRgb['blue']);
            imagesetpixel($this->imgMask, $x, $y, $color);

            if ($this->shouldSwap($x, $y) === false) {
                return;
            }
            $tColor = Utils::deepColor($this->imgDst, $tRgb);
            imagesetpixel($this->imgDst, $tx, $ty, $tColor);
        });
    }

    /**
     * @param $x
     * @param $y
     * @return bool
     */
    private function shouldSwap($x, $y): bool
    {
        [$cx, $cy] = $this->cutPoint;
        $bleY = $this->bleA * $x + $this->bleB;
        switch ($this->curDir) {
            case self::DIR_LT:
            case self::DIR_TR:
                return  $y > $bleY;
            case self::DIR_RB:
            case self::DIR_BL:
                return $y < $bleY;
            case self::DIR_TB:
                return $x < $cx;
            case self::DIR_LR:
                return $y < $cy;
        }
        return true;
    }

    private function initBLEAB(): void
    {
        [$cx, $cy] = $this->cutPoint;
        switch ($this->curDir) {
            case self::DIR_LT:
                //$cy = 0 * a + b
                //0 = $cx * a + b
                $this->bleA = -$cy/$cx;
                $this->bleB = $cy;
                break;
            case self::DIR_TR:
                // 0 = $cx * a + b
                // $cy = $wh * a + b
                //
                // $cy = ($wh - $cx) * a  =>  a = ($wh - $cx) / $cy    ; $b =  - $cx * ($wh - $cx) / $cy
                $this->bleA = ($this->maskWH - $cx) / $cy;
                $this->bleB = -$cx * $this->bleA;
                break;
            case self::DIR_RB:
                //$cx = $wh * a + b
                //$wh = $cy * a + b
                //=> a = ($wh - $cx) / ($cy - $wh);  b = $cx - $wh * a
                $this->bleA = ($this->maskWH - $cx) / ($cy - $this->maskWH);
                $this->bleB = $cx - $this->maskWH * $this->bleA;
                break;
            case self::DIR_BL:
                //$wh = $cx * a + b
                //$cy = 0 * a + b
                $this->bleA = ($this->maskWH - $cy) / $cx;
                $this->bleB = $cy;
                break;
        }
    }

    /**
     * @throws \Exception
     */
    private function initCutPoint(): void
    {
        $min = (int)($this->maskWH * 0.4);
        $max = (int)($this->maskWH * 0.6);
        $this->cutPoint = [
            random_int($min, $max),
            random_int($min, $max)
        ];
    }

    /**
     * @throws \Exception
     */
    public function initCurDir(): void
    {
        $this->curDir = Utils::randValue(self::DIR_ARR);
    }
}
