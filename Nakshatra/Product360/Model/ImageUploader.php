<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Model;

use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\File\Uploader;
use Magento\Framework\Filesystem;
use Magento\Framework\Filesystem\Directory\WriteInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

class ImageUploader
{
    private Filesystem $filesystem;
    private WriteInterface $mediaDirectory;
    private string $baseTmpPath;
    private string $basePath;
    private array $allowedExtensions;
    private StoreManagerInterface $storeManager;
    private LoggerInterface $logger;

    public function __construct(
        Filesystem $filesystem,
        StoreManagerInterface $storeManager,
        LoggerInterface $logger,
        string $baseTmpPath = 'product360/tmp',
        string $basePath = 'product360',
        array $allowedExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']
    ) {
        $this->filesystem = $filesystem;
        $this->mediaDirectory = $filesystem->getDirectoryWrite(DirectoryList::MEDIA);
        $this->storeManager = $storeManager;
        $this->logger = $logger;
        $this->baseTmpPath = $baseTmpPath;
        $this->basePath = $basePath;
        $this->allowedExtensions = $allowedExtensions;
    }

    public function moveFileFromTmp(string $imageName): string
    {
        $baseTmpPath = $this->getBaseTmpPath();
        $basePath = $this->getBasePath();

        $baseImagePath = $this->getFilePath($basePath, Uploader::getNewFileName($imageName));
        $baseTmpImagePath = $this->getFilePath($baseTmpPath, $imageName);

        try {
            $this->mediaDirectory->create($basePath);
            $this->mediaDirectory->renameFile($baseTmpImagePath, $baseImagePath);

            $this->logger->info('Image moved from tmp:', [
                'from' => $baseTmpImagePath,
                'to' => $baseImagePath
            ]);

            return basename($baseImagePath);
        } catch (\Exception $e) {
            $this->logger->error('Error moving file from tmp: ' . $e->getMessage(), [
                'from' => $baseTmpImagePath,
                'to' => $baseImagePath
            ]);
            throw new LocalizedException(__('Something went wrong while moving the file.'));
        }
    }

    public function getBaseTmpPath(): string
    {
        return $this->baseTmpPath;
    }

    public function getBasePath(): string
    {
        return $this->basePath;
    }

    public function getMediaDirectory(): WriteInterface
    {
        return $this->mediaDirectory;
    }

    protected function getFilePath(string $path, string $imageName): string
    {
        return rtrim($path, '/') . '/' . ltrim($imageName, '/');
    }

    public function getBaseUrl(): string
    {
        return $this->storeManager->getStore()->getBaseUrl(UrlInterface::URL_TYPE_MEDIA) . $this->getBasePath() . '/';
    }
}
