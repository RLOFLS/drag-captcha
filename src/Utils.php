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

class Utils
{
    /**
     * @param $img
     * @param $x
     * @param $y
     * @return array|false
     */
    public static function getIndexRgb($img, $x, $y)
    {
        try {

            $idx = @ImageColorAt($img, $x, $y);
            if ($idx === false) {
                return false;
            }
            return imagecolorsforindex($img, $idx);
        } catch (\OutOfRangeException $e) {
            return false;
        }

    }

    /**
     * @param $img
     * @param $oriRgb
     * @return false|int
     */
    public static function deepColor($img, $oriRgb)
    {
        $r = $oriRgb['red'] * 97 / 255;
        $g = $oriRgb['green'] * 97 / 255;
        $b = $oriRgb['blue'] * 97 / 255;
        return imagecolorallocate($img, (int)$r, (int)$g, (int)$b);
    }

    /**
     * @param $imgDst
     * @param $imgMask
     * @param $dst
     * @param \Closure $swapFun
     */
    public static function swapAndDeepMask($imgDst, $imgMask, $dst, \Closure $swapFun): void
    {
        $maskWH = imagesx($imgMask);
        for ($x = 0; $x < $maskWH; $x++) {
            for ($y = 0; $y < $maskWH; $y++) {
                $maskRgb = self::getIndexRgb($imgMask, $x, $y);
                if ($maskRgb === false) {
                    continue;
                }
                if ($maskRgb['alpha'] !== 127) {
                    $tx = $dst['left'] + $x;
                    $ty = $dst['top'] + $y;

                    $tRgb = self::getIndexRgb($imgDst, $tx, $ty);
                    if ($tRgb === false) {
                        continue;
                    }

                    $swapFun($x, $y, $tx, $ty, $tRgb);
                }
            }
        }
    }

    /**
     * @param array $arr
     * @return mixed
     * @throws \Exception
     */
    public static function randValue(array $arr)
    {
        if (empty($arr)) {
            return null;
        }
        return $arr[random_int(0, count($arr) - 1)];
    }

}