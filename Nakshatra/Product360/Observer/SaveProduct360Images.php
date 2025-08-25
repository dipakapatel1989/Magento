<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Exception\LocalizedException;
use Nakshatra\Product360\Api\Product360ImageRepositoryInterface;
use Nakshatra\Product360\Model\Product360ImageFactory;
use Nakshatra\Product360\Model\ImageUploader;
use Psr\Log\LoggerInterface;
use Magento\Framework\Filesystem;
use Magento\Framework\App\Filesystem\DirectoryList;

class SaveProduct360Images implements ObserverInterface
{
    private Product360ImageRepositoryInterface $product360ImageRepository;
    private Product360ImageFactory $product360ImageFactory;
    private ImageUploader $imageUploader;
    private LoggerInterface $logger;
    private Filesystem $filesystem;

    public function __construct(
        Product360ImageRepositoryInterface $product360ImageRepository,
        Product360ImageFactory $product360ImageFactory,
        ImageUploader $imageUploader,
        LoggerInterface $logger,
        Filesystem $filesystem
    ) {
        $this->product360ImageRepository = $product360ImageRepository;
        $this->product360ImageFactory = $product360ImageFactory;
        $this->imageUploader = $imageUploader;
        $this->logger = $logger;
        $this->filesystem = $filesystem;
    }

    public function execute(Observer $observer): void
    {
        try {
            /** @var \Magento\Catalog\Model\Product $product */
            $product = $observer->getEvent()->getProduct();
            $productId = (int)$product->getId();

            if (!$productId) {
                return;
            }

            // Get product360 images data
            $product360Data = $product->getData('product360_images');

            $this->logger->info('SaveProduct360Images Observer - Processing data:', [
                'product_id' => $productId,
                'data' => $product360Data
            ]);

            if (!$product360Data || !is_array($product360Data)) {
                return;
            }

            // Delete existing images for this product
            $this->deleteExistingImages($productId);

            // Process new images
            foreach ($product360Data as $index => $imageData) {
                $this->processImage($productId, $imageData, $index);
            }

            $this->logger->info('SaveProduct360Images Observer - Processing completed', [
                'product_id' => $productId,
                'images_processed' => count($product360Data)
            ]);

        } catch (\Exception $e) {
            $this->logger->error('SaveProduct360Images Observer Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw new LocalizedException(__('Error saving 360° images: %1', $e->getMessage()));
        }
    }

    private function deleteExistingImages(int $productId): void
    {
        try {
            $existingImages = $this->product360ImageRepository->getByProductId($productId);
            foreach ($existingImages as $image) {
                // Delete physical file
                $this->deleteImageFile($image->getImagePath());
                // Delete from database
                $this->product360ImageRepository->delete($image);
            }
        } catch (\Exception $e) {
            $this->logger->error('Error deleting existing images: ' . $e->getMessage());
        }
    }

    private function processImage(int $productId, array $imageData, int $sortOrder): void
    {
        try {
            // Check if this is a new uploaded file or existing one
            if (isset($imageData['file']) && !empty($imageData['file'])) {
                $fileName = $imageData['file'];

                // Move file from tmp to permanent directory if it's a new upload
                if (isset($imageData['tmp_name']) || strpos($fileName, '/tmp/') !== false) {
                    $fileName = $this->imageUploader->moveFileFromTmp($fileName);
                    $this->logger->info('File moved from tmp to permanent:', ['file' => $fileName]);
                }

                // Create new image record
                $product360Image = $this->product360ImageFactory->create();
                $product360Image->setProductId($productId);
                $product360Image->setImagePath($fileName);
                $product360Image->setSortOrder($sortOrder + 1); // Start from 1
                $product360Image->setIsActive(
                    isset($imageData['is_active']) ? (bool)$imageData['is_active'] : true
                );

                // Save to database
                $this->product360ImageRepository->save($product360Image);

                $this->logger->info('Product360 image saved:', [
                    'product_id' => $productId,
                    'image_path' => $fileName,
                    'sort_order' => $sortOrder + 1
                ]);
            }
        } catch (\Exception $e) {
            $this->logger->error('Error processing image: ' . $e->getMessage(), [
                'product_id' => $productId,
                'image_data' => $imageData,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function deleteImageFile(string $imagePath): void
    {
        try {
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            $fullPath = 'product360/' . $imagePath;

            if ($mediaDirectory->isExist($fullPath)) {
                $mediaDirectory->delete($fullPath);
                $this->logger->info('Deleted image file:', ['path' => $fullPath]);
            }
        } catch (\Exception $e) {
            $this->logger->error('Error deleting image file: ' . $e->getMessage(), [
                'image_path' => $imagePath
            ]);
        }
    }
}
