<?php declare(strict_types=1);

namespace Nakshatra\Popup\Controller\Adminhtml\Popup;
use Nakshatra\Popup\Api\Data\PopupInterface;
use Nakshatra\Popup\Api\PopupRepositoryInterface;
use Nakshatra\Popup\Model\ResourceModel\Popup\CollectionFactory;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Controller\ResultInterface;
use Magento\Ui\Component\MassAction\Filter;

class MassDisable extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Popup::popup';
    public function __construct(
        Context $context,
        private readonly Filter $filter,
        private readonly CollectionFactory $collectionFactory,
        private readonly PopupRepositoryInterface $popupRepository
    ) {
        parent::__construct($context);
    }

    /**
     * @return ResultInterface
     */
    public function execute(): ResultInterface
    {
        try {
            $collection = $this->filter->getCollection($this->collectionFactory->create());
            $collectionSize = $collection->getSize();

            /** @var PopupInterface $popup */
            foreach ($collection as $popup) {
                $popup->setIsActive(PopupInterface::STATUS_DISABLED);
                $this->popupRepository->save($popup);
            }
            $this->messageManager->addSuccessMessage(__('A total of %1 record(s) have been disabled.', $collectionSize));
        }

        catch (\Throwable $exception) {
            $this->messageManager->addErrorMessage(
                __('Something went wrong while processing the operation.')
            );
        }

        $result = $this->resultFactory->create(ResultFactory::TYPE_REDIRECT);

        return $result->setPath('nakshatra_popup/popup/index');
    }
}
