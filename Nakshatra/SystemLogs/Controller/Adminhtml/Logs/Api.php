<?php

declare(strict_types=1);

namespace Nakshatra\SystemLogs\Controller\Adminhtml\Logs;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\LocalizedException;
use Nakshatra\SystemLogs\Service\LogReaderService;

class Api extends Action
{
    public const ADMIN_RESOURCE = 'Nakshatra_SystemLogs::logs_view';

    public function __construct(
        Context $context,
        private readonly JsonFactory $resultJsonFactory,
        private readonly LogReaderService $logReaderService
    ) {
        parent::__construct($context);
    }

    public function execute(): Json
    {
        $result = $this->resultJsonFactory->create();

        try {
            $file = $this->getRequest()->getParam('file', 'system.log');
            $page = max(1, (int) $this->getRequest()->getParam('page', 1));
            $level = $this->getRequest()->getParam('level', '');
            $search = $this->getRequest()->getParam('search', '');
            $realtime = $this->getRequest()->getParam('realtime', '0') === '1';
            $perPage = 100;

            $data = $this->logReaderService->getLogs($file, $page, $perPage, $level, $search, $realtime);

            return $result->setData($data);
        } catch (LocalizedException $e) {
            return $result->setHttpResponseCode(400)->setData(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            return $result->setHttpResponseCode(500)->setData(['error' => __('An error occurred while reading logs.')]);
        }
    }
}
