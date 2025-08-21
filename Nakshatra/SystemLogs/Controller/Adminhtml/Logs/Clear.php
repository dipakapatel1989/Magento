<?php

declare(strict_types=1);

namespace Nakshatra\SystemLogs\Controller\Adminhtml\Logs;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Controller\Result\Json;
use Nakshatra\SystemLogs\Service\LogReaderService;
use Magento\Framework\Exception\LocalizedException;

class Clear extends Action
{
    public const ADMIN_RESOURCE = 'Nakshatra_SystemLogs::logs_manage';

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
            $requestData = $this->getRequest()->getContent();
            $data = json_decode($requestData, true, 512, JSON_THROW_ON_ERROR);
            $file = $data['file'] ?? '';

            $this->logReaderService->clearLog($file);

            return $result->setData([
                'success' => true,
                'message' => __('Log cleared successfully')
            ]);
        } catch (LocalizedException $e) {
            return $result->setHttpResponseCode(400)->setData(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            return $result->setHttpResponseCode(500)->setData(['error' => __('An error occurred while clearing the log.')]);
        }
    }
}
