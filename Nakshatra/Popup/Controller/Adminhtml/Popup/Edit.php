<?php declare(strict_types=1);

namespace Nakshatra\Popup\Controller\Adminhtml\Popup;

use Nakshatra\Popup\Api\Data\PopupInterfaceFactory;
use Nakshatra\Popup\Api\PopupRepositoryInterface;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Controller\ResultInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Result\Page;

class   Edit extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Popup::popup';
    public function __construct(
        Context $context,
        private readonly PopupRepositoryInterface $popupRepository,
        private readonly DataPersistorInterface $dataPersistor,
        private readonly PopupInterfaceFactory $popupFactory
    ) {
        parent::__construct($context);
    }

    public function execute(): ResultInterface
    {
        /** @var Page $page */
        $page = $this->resultFactory->create(ResultFactory::TYPE_PAGE);

        $popupId = (int) $this->getRequest()->getParam('popup_id');

        if ($popupId) {
            try {
                $popup = $this->popupRepository->getById($popupId);
                $this->dataPersistor->set('nakshatra_popup_popup', $popup->getData());
            } catch (NoSuchEntityException $exception) {
                $this->messageManager->addErrorMessage(__('This popup no longer exists.'));
            }
        } else {
            $popup = $this->popupFactory->create();
        }
        $page->setActiveMenu('Nakshatra_Popup::popup');
        $page->addBreadcrumb(__('Popups'), __('Popups'));
        $page->addBreadcrumb(
            $popup->getPopupId() ? $popup->getName() : __('New Popup'),
            $popup->getPopupId() ? $popup->getName() : __('New Popup')
        );
        $page->getConfig()->getTitle()->prepend(
            $popup->getPopupId() ? $popup->getName() : __('New Popup')
        );
        return $page;
    }
}
