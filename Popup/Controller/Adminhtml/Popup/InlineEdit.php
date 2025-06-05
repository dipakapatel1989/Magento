<?php declare(strict_types=1);

namespace Nakshatra\Popup\Controller\Adminhtml\Popup;

use Nakshatra\Popup\Api\PopupRepositoryInterface;
use Nakshatra\Popup\Model\Popup;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Controller\ResultInterface;

class InlineEdit extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Popup::popup';
    public function __construct(
        Context $context,
        private readonly PopupRepositoryInterface $popupRepository
    )
    {
        parent::__construct($context);
    }

    /**
     * @return ResultInterface
     */
    public function execute(): ResultInterface
    {
        $result = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $items = $this->getRequest()->getParam('items');
        $messages = [];
        $error = false;
        if (!count($items))
        {
            $messages[]= __('Please correct the data sent.');
            $error = true;
        }
        else
        {
            foreach(array_keys($items) as $popupId) {
                try{
                    /**
                     * @var Popup $popup
                     */
                    $popup = $this->popupRepository->getById((int) $popupId);
                    $popup->setData(array_merge($popup->getData(), $items[$popupId]));
                    $this->popupRepository->save($popup);
                    }
                    catch (\Throwable $exception)
                    {
                        $messages[] = '[Popup ID: '. $popupId . ']'.$exception->getMessage();
                        $error = true;
                    }
                }
        }
        return $result->setData(
            [
                'message' => $messages,
                'error' => $error
            ]
        );
    }
}
