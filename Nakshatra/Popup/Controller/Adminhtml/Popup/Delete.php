<?php declare(strict_types=1);

namespace Nakshatra\Popup\Controller\Adminhtml\Popup;

use Nakshatra\Popup\Api\PopupRepositoryInterface;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Controller\ResultInterface;

class Delete extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Popup::popup';
    public function __construct(
        Context $context,
        private readonly PopupRepositoryInterface $popupRepository
    ) {
        parent::__construct($context);
    }

    /**
     * @return ResultInterface
     */
    public function execute(): ResultInterface
    {
        $popupId = (int) $this->getRequest()->getParam('popup_id', 0);
        $result = $this->resultFactory->create(ResultFactory::TYPE_REDIRECT);
        if (!$popupId) {
            $this->messageManager->addWarningMessage(
                __('The popup with the provided id was not found.')
            );
            return $result->setPath('nakshatra_popup/popup/index');
        }
        try {
            $popup = $this->popupRepository->getById($popupId);
            if (!$popup->getPopupId())
            {
                $this->messageManager->addWarningMessage(
                    __('The popup with the provided id was not found.')
                );
            }
            else {
                $this->popupRepository->delete($popup);
                $this->messageManager->addSuccessMessage(__('The popup has been deleted.'));
            }
        }
        catch (\Throwable $exception) {
            $this->messageManager->addErrorMessage(
                __('Something went wrong while processing the operation.')
            );
        }

        return $result->setPath('nakshatra_popup/popup/index');
    }
}
