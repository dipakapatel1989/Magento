<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Plugin\Product;

use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Model\Product;
use Psr\Log\LoggerInterface;

class ProcessProduct360Data
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function beforeSave(Product $subject): void
    {
        // Get the request data
        $request = \Magento\Framework\App\ObjectManager::getInstance()
            ->get(\Magento\Framework\App\RequestInterface::class);

        $product360Data = $request->getParam('product360_images');

        $this->logger->info('Product360 Plugin - Raw data:', [
            'product360_images' => $product360Data,
            'all_params' => array_keys($request->getParams())
        ]);

        if ($product360Data !== null) {
            // Set the data on the product so the observer can access it
            $subject->setData('product360_images', $product360Data);

            $this->logger->info('Product360 Plugin - Data set on product:', [
                'product_id' => $subject->getId(),
                'data_set' => $product360Data
            ]);
        }
    }
}
