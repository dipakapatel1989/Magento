<?php declare(strict_types=1);

namespace Nakshatra\SuperSearch\Block;

use Magento\Catalog\Helper\Image;
use Magento\Catalog\Model\ProductFactory;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;

class GetProductImage extends Template
{
    protected $imageHelper;
    protected $productFactory;

    /**
     * @param Image $imageHelper
     * @param ProductFactory $productFactory
     * @param Context $context
     */
    public function __construct(
        Image $imageHelper,
        ProductFactory $productFactory,
        Context $context
    ) {
        $this->imageHelper = $imageHelper;
        $this->productFactory = $productFactory;
    }

    /**
     * @param $data
     * @return array|string
     */
    public function getProductImageUrls($data) : array
    {
        $imageUrl=[];
        foreach ($data as $image) {
            try {
                $product = $this->productFactory->create()->load($image['entity_id']);
                $imageUrl[] = $this->imageHelper->init($product, 'product_thumbnail_image')->getUrl();
            } catch (NoSuchEntityException $e) {
                return 'Data not found';
            }
        }
        return $imageUrl;
    }
}
