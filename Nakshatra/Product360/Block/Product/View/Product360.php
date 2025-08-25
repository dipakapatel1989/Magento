<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Block\Product\View;

use Magento\Catalog\Model\Product;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Store\Model\StoreManagerInterface;
use Nakshatra\Product360\Api\Product360ImageRepositoryInterface;
use Nakshatra\Product360\Helper\Data as Product360Helper;

class Product360 extends Template
{
    protected $_template = 'Nakshatra_Product360::product/view/product360.phtml';

    private Registry $registry;
    private Product360Helper $product360Helper;
    private Product360ImageRepositoryInterface $product360ImageRepository;
    private StoreManagerInterface $storeManager;

    public function __construct(
        Context $context,
        Registry $registry,
        Product360Helper $product360Helper,
        Product360ImageRepositoryInterface $product360ImageRepository,
        StoreManagerInterface $storeManager,
        array $data = []
    ) {
        $this->registry = $registry;
        $this->product360Helper = $product360Helper;
        $this->product360ImageRepository = $product360ImageRepository;
        $this->storeManager = $storeManager;
        parent::__construct($context, $data);
    }

    public function canShow(): bool
    {
        if (!$this->product360Helper->isEnabled()) {
            return false;
        }

        $product = $this->getProduct();
        if (!$product || !$product->getData('enable_360_view')) {
            return false;
        }

        return count($this->get360Images()) > 0;
    }

    public function getProduct(): ?Product
    {
        return $this->registry->registry('current_product');
    }

    public function getProductIds(): int
    {
        $product = $this->getProduct();
        return (int)$product?->getId() | 0;
    }
    public function get360Images(): array
    {
        $product = $this->getProduct();
        if (!$product) {
            return [];
        }

        // Cast product ID to integer to ensure type compatibility
        $productId = (int) $product->getId();
        $images = $this->product360ImageRepository->getByProductId($productId);
        $imageUrls = [];

        foreach ($images as $image) {
            $imageUrls[] = $this->getImageUrl($image->getImagePath());
        }

        return $imageUrls;

    }

    public function getImageUrl(string $imagePath): string
    {
        return $this->storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA)
            . 'product360/images/' . $this->getProductIds() . '/' . $imagePath;
    }

    public function getConfig(): array
    {
        return [
            'autoPlay' => $this->product360Helper->isAutoPlayEnabled(),
            'rotationSpeed' => $this->product360Helper->getRotationSpeed(),
            'showControls' => $this->product360Helper->showControls(),
            'viewerWidth' => $this->product360Helper->getViewerWidth(),
            'viewerHeight' => $this->product360Helper->getViewerHeight(),
            'images' => $this->get360Images()
        ];
    }

    public function getJsonConfig(): string
    {
        return json_encode($this->getConfig());
    }

    public function getProduct360Helper(): Product360Helper
    {
        return $this->product360Helper;
    }

}
