<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model\Product\Attribute\Backend;

use Magento\Eav\Model\Entity\Attribute\Backend\AbstractBackend;
use Magento\Framework\Exception\LocalizedException;
use Psr\Log\LoggerInterface;

class Images extends AbstractBackend
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function beforeSave($object)
    {
        $value = $object->getData($this->getAttribute()->getAttributeCode());

        if ($value && is_array($value)) {
            // Process the uploaded files data
            $this->logger->info('Product360 Images data before save:', $value);

            // Convert array to JSON for storage if needed
            if (isset($value['images']) && is_array($value['images'])) {
                $object->setData('product360_images', $value);
            }
        }

        return parent::beforeSave($object);
    }
}
