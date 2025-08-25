<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model;

use Magento\Framework\Exception\LocalizedException;
use Nakshatra\Product360\Api\Product360ImageRepositoryInterface;
use Nakshatra\Product360\Model\Product360ImageFactory;
use Psr\Log\LoggerInterface;

class Product360ImageManager
{
    private Product360ImageRepositoryInterface $product360ImageRepository;
    private Product360ImageFactory $product360ImageFactory;
    private ImageUploader $imageUploader;
    private LoggerInterface $logger;

    public function __construct(
        Product360ImageRepositoryInterface $product360ImageRepository,
        Product360ImageFactory $product360ImageFactory,
        ImageUploader $imageUploader,
        LoggerInterface $logger
    ) {
        $this->product360ImageRepository = $product360ImageRepository;
        $this->product360ImageFactory = $product360ImageFactory;
        $this->imageUploader = $imageUploader;
        $this->logger = $logger;
    }

    /**
     * Save product 360 images
     *
     * @param int $productId
     * @param array $imageData
     * @param bool $replaceExisting
     * @return array
     * @throws LocalizedException
     */
    public function saveImages(int $productId, array $imageData, bool $replaceExisting = true): array
    {
        try {
            if ($replaceExisting) {
                $this->deleteProductImages($productId);
            }

            $savedImages = [];
            foreach ($imageData as $index => $data) {
                if (!empty($data['file'])) {
                    $image = $this->createImage($productId, $data, $index);
                    if ($image) {
                        $savedImages[] = $image;
                    }
                }
            }

            return $savedImages;

        } catch (\Exception $e) {
            $this->logger->error('Error saving product 360 images: ' . $e->getMessage());
            throw new LocalizedException(__('Failed to save images: %1', $e->getMessage()));
        }
    }

    /**
     * Add single image to product
     *
     * @param int $productId
     * @param array $imageData
     * @return array|null
     */
    public function addImage(int $productId, array $imageData): ?array
    {
        try {
            // Get current max sort order
            $existingImages = $this->product360ImageRepository->getByProductId($productId);
            $maxSortOrder = 0;
            foreach ($existingImages as $image) {
                $maxSortOrder = max($maxSortOrder, $image->getSortOrder());
            }

            return $this->createImage($productId, $imageData, $maxSortOrder);

        } catch (\Exception $e) {
            $this->logger->error('Error adding image: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete all images for a product
     *
     * @param int $productId
     * @return bool
     */
    public function deleteProductImages(int $productId): bool
    {
        try {
            $images = $this->product360ImageRepository->getByProductId($productId);
            foreach ($images as $image) {
                $this->deleteImageFile($image->getImagePath());
                $this->product360ImageRepository->delete($image);
            }
            return true;

        } catch (\Exception $e) {
            $this->logger->error('Error deleting product images: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update image sort order
     *
     * @param int $imageId
     * @param int $sortOrder
     * @return bool
     */
    public function updateSortOrder(int $imageId, int $sortOrder): bool
    {
        try {
            $image = $this->product360ImageRepository->getById($imageId);
            $image->setSortOrder($sortOrder);
            $this->product360ImageRepository->save($image);
            return true;

        } catch (\Exception $e) {
            $this->logger->error('Error updating sort order: ' . $e->getMessage());
            return false;
        }
    }

    private function createImage(int $productId, array $imageData, int $sortOrder): ?array
    {
        try {
            $fileName = $imageData['file'];

            // Move file from tmp to permanent directory if needed
            if (isset($imageData['tmp_name']) || strpos($fileName, '/tmp/') !== false) {
                $fileName = $this->imageUploader->moveFileFromTmp($fileName);
            }

            // Create new image record
            $product360Image = $this->product360ImageFactory->create();
            $product360Image->setProductId($productId);
            $product360Image->setImagePath($fileName);
            $product360Image->setSortOrder($sortOrder + 1);
            $product360Image->setIsActive(
                isset($imageData['is_active']) ? (bool)$imageData['is_active'] : true
            );

            // Save to database
            $this->product360ImageRepository->save($product360Image);

            return [
                'id' => $product360Image->getId(),
                'file' => $fileName,
                'url' => $this->imageUploader->getBaseUrl() . $fileName,
                'sort_order' => $product360Image->getSortOrder(),
                'is_active' => $product360Image->getIsActive()
            ];

        } catch (\Exception $e) {
            $this->logger->error('Error creating image: ' . $e->getMessage());
            return null;
        }
    }

    private function deleteImageFile(string $imagePath): void
    {
        try {
            $mediaDirectory = $this->imageUploader->getMediaDirectory();
            $fullPath = $this->imageUploader->getBasePath() . '/' . $imagePath;

            if ($mediaDirectory->isExist($fullPath)) {
                $mediaDirectory->delete($fullPath);
            }
        } catch (\Exception $e) {
            $this->logger->error('Error deleting image file: ' . $e->getMessage());
        }
    }
}
