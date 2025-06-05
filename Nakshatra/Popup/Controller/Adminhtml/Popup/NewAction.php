<?php

namespace Nakshatra\Popup\Controller\Adminhtml\Popup;

use Magento\Backend\App\Action;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Controller\ResultInterface;

class NewAction extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Popup::popup';
    public function execute(): ResultInterface
    {
        return $this->resultFactory->create(ResultFactory::TYPE_FORWARD)
            ->forward('edit');

    }

}
