<?php declare(strict_types=1);

namespace Nakshatra\Popup\Api;

use Nakshatra\Popup\Api\Data\PopupInterface;

interface PopupManagementInterface
{
    /**
     * @return PopupInterface
     */
    public function getApplicablePopup(): PopupInterface;
}
