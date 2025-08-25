<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model;

use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Nakshatra\Product360\Api\Product360ImageRepositoryInterface;
use Nakshatra\Product360\Model\Product360ImageFactory;
use Nakshatra\Product360\Model\ResourceModel\Product360Image as Product360ImageResource;
use Nakshatra\Product360\Model\ResourceModel\Product360Image\CollectionFactory;

class Product360ImageRepository implements Product360ImageRepositoryInterface
{
    private Product360ImageFactory $product360ImageFactory;
    private Product360ImageResource $resource;
    private CollectionFactory $collectionFactory;

    public function __construct(
        Product360ImageFactory $product360ImageFactory,
        Product360ImageResource $resource,
        CollectionFactory $collectionFactory
    ) {
        $this->product360ImageFactory = $product360ImageFactory;
        $this->resource = $resource;
        $this->collectionFactory = $collectionFactory;
    }

    public function save(Product360Image $product360Image): Product360Image
    {
        try {
            $this->resource->save($product360Image);
        } catch (\Exception $e) {
            throw new LocalizedException(__('Could not save the 360 image: %1', $e->getMessage()));
        }
        return $product360Image;
    }

    public function getById(int $imageId): Product360Image
    {
        $product360Image = $this->product360ImageFactory->create();
        $this->resource->load($product360Image, $imageId);

        if (!$product360Image->getId()) {
            throw new NoSuchEntityException(__('360 image with id "%1" does not exist.', $imageId));
        }

        return $product360Image;
    }

    public function getByProductId(int $productId): array
    {
        $collection = $this->collectionFactory->create();
        $collection->addProductFilter($productId)
            ->addActiveFilter()
            ->setDefaultOrder(); // Use the renamed method

        return $collection->getItems();
    }

    public function delete(Product360Image $product360Image): bool
    {
        try {
            $this->resource->delete($product360Image);
        } catch (\Exception $e) {
            throw new LocalizedException(__('Could not delete the 360 image: %1', $e->getMessage()));
        }
        return true;
    }

    public function deleteById(int $imageId): bool
    {
        return $this->delete($this->getById($imageId));
    }
}
