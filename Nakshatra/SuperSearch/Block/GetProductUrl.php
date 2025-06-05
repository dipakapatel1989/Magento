<?php declare(strict_types=1);

namespace Nakshatra\SuperSearch\Block;

use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Api\ProductRepositoryInterface;

class GetProductUrl extends Template
{
    protected $productModel;
    protected $productRepository;
    public function __construct(
        Context $context,
        Product $productModel,
        ProductRepositoryInterface $productRepository,
        StoreManagerInterface $storeManager,
    ) {
        $this->productModel = $productModel;
        $this->productRepository = $productRepository;
        $this->storeManager = $storeManager;
        parent::__construct($context);
    }
    /**
     * @throws NoSuchEntityException
     */
    public function getStoreId()
    {
        return $this->storeManager->getStore()->getId();
    }

    /**
     * @param $productId
     * @param $storeId
     * @return array|null
     * @throws NoSuchEntityException
     */

    public function getProductUrl($data)
    {
        $storeId= $this->getStoreId();
        $productURL=[];
        foreach ($data as $url) {
            try {
                $product = $this->productRepository->getById($url['entity_id'], false, $storeId);
                $productURL[] = $product->setStoreId($storeId)->getUrlModel()->getUrlInStore($product, ['_escape' => true]);
            } catch (NoSuchEntityException $e) {
                return 'Data not found';
            }
        }
        return $productURL;
    }

}
