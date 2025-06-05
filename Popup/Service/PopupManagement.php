<?php

namespace Nakshatra\Popup\Service;

use Nakshatra\Popup\Api\Data\PopupInterface;
use Nakshatra\Popup\Api\PopupManagementInterface;
use Nakshatra\Popup\Model\ResourceModel\Popup\Collection;
use Nakshatra\Popup\Model\ResourceModel\Popup\CollectionFactory;

class PopupManagement implements PopupManagementInterface
{
    public function __construct(
        private  readonly CollectionFactory $collectionFactory
    ) {
    }

    /**
     * @return PopupInterface
     */
    public function getApplicablePopup(): PopupInterface
    {
        /** @var PopupInterface $popup */
        $popup = $this->getCollection()
            ->addFieldToFilter('is_active', PopupInterface::STATUS_ENABLED)
            ->addOrder('popup_id')
            ->getFirstItem();

        return $popup;
    }

    /**
     * @return Collection
     */
    private function getCollection(): Collection
    {
        return $this->collectionFactory->create();
    }
}
