<?php
namespace Nakshatra\Product360\Controller\Adminhtml\Image;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Psr\Log\LoggerInterface;

class Save extends Action
{
    const ADMIN_RESOURCE = 'Nakshatra_Product360::product360_save';

    private JsonFactory $jsonFactory;
    private Filesystem $filesystem;
    private StoreManagerInterface $storeManager;
    private ProductRepositoryInterface $productRepository;
    private LoggerInterface $logger;

    public function __construct(
        Context $context,
        JsonFactory $jsonFactory,
        Filesystem $filesystem,
        StoreManagerInterface $storeManager,
        ProductRepositoryInterface $productRepository,
        LoggerInterface $logger
    ) {
        parent::__construct($context);
        $this->jsonFactory = $jsonFactory;
        $this->filesystem = $filesystem;
        $this->storeManager = $storeManager;
        $this->productRepository = $productRepository;
        $this->logger = $logger;
    }

    public function execute()
    {
        $result = $this->jsonFactory->create();

        try {
            // Validate request
            if (!$this->getRequest()->isPost()) {
                throw new LocalizedException(__('Invalid request method'));
            }

            // Get product ID
            $productId = $this->getRequest()->getParam('product_id');
            if (!$productId) {
                throw new LocalizedException(__('Product ID is required'));
            }

            // Validate product exists
            try {
                $product = $this->productRepository->getById($productId);
            } catch (\Exception $e) {
                throw new LocalizedException(__('Product not found with ID: %1', $productId));
            }

            // Get uploaded files
            $files = $this->getRequest()->getFiles('product360_images');
            if (!$files || empty($files)) {
                throw new LocalizedException(__('No images were uploaded'));
            }

            // Get image metadata
            $imageMetadata = $this->getRequest()->getParam('image_metadata', []);

            $this->logger->info('Product360 Save - Processing files', [
                'product_id' => $productId,
                'files_count' => count($files),
                'metadata_count' => count($imageMetadata)
            ]);

            // Process each uploaded file
            $savedImages = [];
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            $pubDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::PUB);

            $basePath = 'product360/images/' . $productId . '/';
            $pubBasePath = 'media/product360/images/' . $productId . '/';

            // Ensure directories exist
            $mediaDirectory->create($basePath);
            $pubDirectory->create($pubBasePath);

            foreach ($files as $index => $fileData) {
                if (!isset($fileData['tmp_name']) || !is_uploaded_file($fileData['tmp_name'])) {
                    $this->logger->warning('Invalid file at index: ' . $index, $fileData);
                    continue;
                }

                try {
                    // Get metadata for this file
                    $metadata = $imageMetadata[$index] ?? [];
                    $originalName = $metadata['name'] ?? $fileData['name'];
                    $sortOrder = $metadata['sort_order'] ?? $index;
                    $isActive = $metadata['is_active'] ?? true;

                    // Validate file type
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!in_array($fileData['type'], $allowedTypes)) {
                        throw new LocalizedException(__('Invalid file type for: %1', $originalName));
                    }

                    // Validate file size (2MB limit)
                    $maxFileSize = 2 * 1024 * 1024; // 2MB
                    if ($fileData['size'] > $maxFileSize) {
                        throw new LocalizedException(__('File too large: %1', $originalName));
                    }

                    // Generate unique filename
                    $fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);
                    $fileName = $this->generateUniqueFileName($originalName, $fileExtension, $mediaDirectory, $basePath);

                    // Move uploaded file to media directory
                    $mediaFilePath = $basePath . $fileName;
                    $absoluteMediaPath = $mediaDirectory->getAbsolutePath($mediaFilePath);

                    if (!move_uploaded_file($fileData['tmp_name'], $absoluteMediaPath)) {
                        throw new LocalizedException(__('Failed to save file: %1', $originalName));
                    }

                    // Copy to pub directory for web access
                    $pubFilePath = $pubBasePath . $fileName;
                    $mediaContent = $mediaDirectory->readFile($mediaFilePath);
                    $pubDirectory->writeFile($pubFilePath, $mediaContent);

                    // Generate URL
                    $baseMediaUrl = $this->storeManager->getStore()->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
                    $fileUrl = $baseMediaUrl . 'product360/images/' . $productId . '/' . $fileName;

                    // Store image information
                    $imageInfo = [
                        'original_name' => $originalName,
                        'file_name' => $fileName,
                        'file_path' => $mediaFilePath,
                        'url' => $fileUrl,
                        'sort_order' => (int)$sortOrder,
                        'is_active' => (bool)$isActive,
                        'size' => $fileData['size'],
                        'type' => $fileData['type']
                    ];

                    $savedImages[] = $imageInfo;

                    $this->logger->info('Product360 Image saved successfully', [
                        'product_id' => $productId,
                        'original_name' => $originalName,
                        'saved_name' => $fileName,
                        'url' => $fileUrl
                    ]);

                } catch (\Exception $e) {
                    $this->logger->error('Error saving image at index ' . $index . ': ' . $e->getMessage(), [
                        'file_data' => $fileData,
                        'metadata' => $metadata ?? []
                    ]);
                    // Continue with other files
                    continue;
                }
            }

            if (empty($savedImages)) {
                throw new LocalizedException(__('No images were successfully saved'));
            }

            // Save image data to product
            $this->saveImagesToProduct($product, $savedImages);

            $result->setData([
                'success' => true,
                'message' => __('%1 image(s) saved successfully', count($savedImages)),
                'images' => $savedImages,
                'product_id' => $productId,
                'images_count' => count($savedImages)
            ]);

        } catch (LocalizedException $e) {
            $this->logger->error('Product360 Save error: ' . $e->getMessage());
            $result->setData([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Product360 Save unexpected error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            $result->setData([
                'success' => false,
                'message' => __('An unexpected error occurred while saving images'),
                'error' => $e->getMessage()
            ]);
        }

        return $result;
    }

    /**
     * Generate unique filename to avoid conflicts
     */
    private function generateUniqueFileName(string $originalName, string $extension, $directory, string $basePath): string
    {
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);

        $fileName = $baseName . '.' . $extension;
        $counter = 1;

        while ($directory->isExist($basePath . $fileName)) {
            $fileName = $baseName . '_' . $counter . '.' . $extension;
            $counter++;
        }

        return $fileName;
    }

    /**
     * Save images data to product
     */
    private function saveImagesToProduct($product, array $savedImages): void
    {
        try {
            // Convert images array to JSON for storage
            $imagesJson = json_encode($savedImages);

            // Save to product (customize based on your attribute setup)
            $product->setData('product360_images', $imagesJson);
            $this->productRepository->save($product);

            $this->logger->info('Product360 images data saved to product', [
                'product_id' => $product->getId(),
                'images_count' => count($savedImages)
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error saving images data to product: ' . $e->getMessage(), [
                'product_id' => $product->getId()
            ]);
            throw new LocalizedException(__('Images uploaded but failed to save to product'));
        }
    }

    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed(self::ADMIN_RESOURCE);
    }
}
