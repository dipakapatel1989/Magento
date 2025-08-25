<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\ScopeInterface;

class Data extends AbstractHelper
{
    public const XML_PATH_ENABLED = 'product360/general/enabled';
    public const XML_PATH_AUTO_PLAY = 'product360/general/auto_play';
    public const XML_PATH_ROTATION_SPEED = 'product360/general/rotation_speed';
    public const XML_PATH_SHOW_CONTROLS = 'product360/general/show_controls';
    public const XML_PATH_VIEWER_WIDTH = 'product360/general/viewer_width';
    public const XML_PATH_VIEWER_HEIGHT = 'product360/general/viewer_height';

    public function isEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_ENABLED, ScopeInterface::SCOPE_STORE, $storeId);
    }

    public function isAutoPlayEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_AUTO_PLAY, ScopeInterface::SCOPE_STORE, $storeId);
    }

    public function getRotationSpeed(?int $storeId = null): int
    {
        return (int)$this->scopeConfig->getValue(self::XML_PATH_ROTATION_SPEED, ScopeInterface::SCOPE_STORE, $storeId) ?: 100;
    }

    public function showControls(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_SHOW_CONTROLS, ScopeInterface::SCOPE_STORE, $storeId);
    }

    public function getViewerWidth(?int $storeId = null): string
    {
        return $this->scopeConfig->getValue(self::XML_PATH_VIEWER_WIDTH, ScopeInterface::SCOPE_STORE, $storeId) ?: '100%';
    }

    public function getViewerHeight(?int $storeId = null): string
    {
        return $this->scopeConfig->getValue(self::XML_PATH_VIEWER_HEIGHT, ScopeInterface::SCOPE_STORE, $storeId) ?: '400px';
    }
}
