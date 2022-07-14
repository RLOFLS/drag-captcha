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

interface ConfuseInterface
{
    /**
     * ConfuseInterface constructor.
     */
    public function __construct($dst, $mask, $imgDst, $imgMask);

    /**
     * Swap background and mask pixels
     * @return void
     */
    public function swapPixels(): void;

}