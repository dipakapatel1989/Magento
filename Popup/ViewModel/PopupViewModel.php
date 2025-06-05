<?php

namespace Nakshatra\Popup\ViewModel;

use Nakshatra\Popup\Api\Data\PopupInterface;
use Nakshatra\Popup\Api\PopupManagementInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class PopupViewModel implements ArgumentInterface
{
    /**
     * @param PopupManagementInterface $popupManagement
     */
    public function __construct(
        private readonly PopupManagementInterface $popupManagement
    ) {
    }

    /**
     * @return PopupInterface
     */
    public function getPopup(): PopupInterface
    {
        return  $this->popupManagement->getApplicablePopup();
    }
}
