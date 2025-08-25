<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

class Product360Image extends AbstractDb
{
    protected function _construct(): void
    {
        $this->_init('nakshatra_product360_images', 'entity_id');
    }

}
