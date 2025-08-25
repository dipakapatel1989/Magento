<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Api;

use Nakshatra\Product360\Model\Product360Image;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;

interface Product360ImageRepositoryInterface
{
    /**
     * Save Product 360 Image
     *
     * @param Product360Image $product360Image
     * @return Product360Image
     * @throws LocalizedException
     */
    public function save(Product360Image $product360Image): Product360Image;

    /**
     * Get Product 360 Image by ID
     *
     * @param int $imageId
     * @return Product360Image
     * @throws NoSuchEntityException
     */
    public function getById(int $imageId): Product360Image;

    /**
     * Get Product 360 Images by Product ID
     *
     * @param int $productId
     * @return Product360Image[]
     */
    public function getByProductId(int $productId): array;

    /**
     * Delete Product 360 Image
     *
     * @param Product360Image $product360Image
     * @return bool
     * @throws LocalizedException
     */
    public function delete(Product360Image $product360Image): bool;

    /**
     * Delete Product 360 Image by ID
     *
     * @param int $imageId
     * @return bool
     * @throws LocalizedException
     * @throws NoSuchEntityException
     */
    public function deleteById(int $imageId): bool;
}
