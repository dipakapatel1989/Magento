<?php declare(strict_types=1);

namespace Nakshatra\Popup\Service;

use Nakshatra\Popup\Api\Data\PopupInterface;
use Nakshatra\Popup\Api\PopupRepositoryInterface;
use Nakshatra\Popup\Model\PopupFactory;
use Nakshatra\Popup\Model\ResourceModel\Popup as PopupResource;
use Magento\Framework\Exception\AlreadyExistsException;
use Magento\Framework\Exception\NoSuchEntityException;

class PopupRepository implements PopupRepositoryInterface
{
    /**
     * @param PopupResource $resource
     * @param PopupFactory $factory
     */
    public function __construct(
        private readonly PopupResource $resource,
        private readonly PopupFactory $factory
    )
    {  }

    /**
     * @param PopupFactory $popup
     * @return void
     * @throws AlreadyExistsException
     */

    public function save(PopupInterface $popup): void
    {
        $this->resource->save($popup);
    }

    /**
     * @param PopupInterface $popup
     * @return void
     * @throws \Exception
     */
    public function delete(PopupInterface $popup): void
    {
        $this->resource->delete($popup);
    }

    /**
     * @param int $popupId
     * @return PopupInterface
     * @throws NoSuchEntityException
     */
    public function getById(int $popupId): PopupInterface
    {
        $popup = $this->factory->create();
        $this->resource->load($popup, $popupId);
        if(!$popup->getId()){
            throw new NoSuchEntityException(
                __('The popup with id %1 does not exist.',$popupId)
            );
        }
        return $popup;
    }
}
