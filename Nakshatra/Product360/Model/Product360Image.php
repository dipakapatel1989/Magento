<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model;

use Magento\Framework\Model\AbstractModel;
use Nakshatra\Product360\Model\ResourceModel\Product360Image as Product360ImageResource;

class Product360Image extends AbstractModel
{
    protected function _construct(): void
    {
        $this->_init(Product360ImageResource::class);
    }

    public function getProductId(): ?int
    {
        return $this->getData('product_id') ? (int)$this->getData('product_id') : null;
    }

    public function setProductId(int $productId): self
    {
        return $this->setData('product_id', $productId);
    }

    public function getImagePath(): ?string
    {
        return $this->getData('image_path');
    }

    public function setImagePath(string $imagePath): self
    {
        return $this->setData('image_path', $imagePath);
    }

    public function getSortOrder(): int
    {
        return (int)$this->getData('sort_order');
    }

    public function setSortOrder(int $sortOrder): self
    {
        return $this->setData('sort_order', $sortOrder);
    }

    public function getIsActive(): bool
    {
        return (bool)$this->getData('is_active');
    }

    public function setIsActive(bool $isActive): self
    {
        return $this->setData('is_active', $isActive);
    }
}
