<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model\ResourceModel\Product360Image;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Nakshatra\Product360\Model\Product360Image;
use Nakshatra\Product360\Model\ResourceModel\Product360Image as Product360ImageResource;

class Collection extends AbstractCollection
{
    protected $_idFieldName = 'entity_id';

    protected function _construct(): void
    {
        $this->_init(Product360Image::class, Product360ImageResource::class);
    }

    public function addProductFilter(int $productId): self
    {
        $this->addFieldToFilter('product_id', $productId);
        return $this;
    }

    public function addActiveFilter(): self
    {
        $this->addFieldToFilter('is_active', 1);
        return $this;
    }

    public function setDefaultOrder(): self
    {
        $this->setOrder('sort_order', 'ASC');
        return $this;
    }
}
