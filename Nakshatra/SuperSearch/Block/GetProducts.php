<?php declare(strict_types=1);

namespace Nakshatra\SuperSearch\Block;

use Magento\Catalog\Model\Product\Attribute\Source\Status;
use Magento\Catalog\Model\Product\Visibility;
use Magento\Catalog\Model\ProductFactory;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Store\Model\StoreManagerInterface;

class GetProducts extends Template
{
    /**
     * Core store config
     *
     * @var ScopeConfigInterface
     */
    protected $_scopeConfig;

    /**
     * Store manager
     *
     * @var StoreManagerInterface
     */
    protected $_storeManager;

    /**
     * @var ProductFactory
     */

    protected $product;

    /**
     * @param Context $context
     * @param CollectionFactory $productCollection
     * @param StoreManagerInterface $storeManager
     * @param ScopeConfigInterface $scopeConfig
     * @param Status $productStatus
     * @param Visibility $productVisibility
     */
    public function __construct(
        Context $context,
        CollectionFactory $productCollection,
        StoreManagerInterface $storeManager,
        ScopeConfigInterface $scopeConfig,
        Status $productStatus,
        Visibility $productVisibility
    ) {
        $this->product = $productCollection;
        $this->storeManager = $storeManager;
        $this->scopeConfig = $scopeConfig;
        $this->productStatus = $productStatus;
        $this->productVisibility = $productVisibility;
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
     * @param $keyword
     * @return array|null
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function getSearchItems($keyword): ?array
    {
        /** @var \Magento\Catalog\Model\ResourceModel\Product\Collection $collection */
        $collection = $this->product->create();
        $collection->setStoreId($this->getStoreId());
        $collection->joinAttribute('status', 'catalog_product/status', 'entity_id', null, 'inner');
        $collection->joinAttribute('visibility', 'catalog_product/visibility', 'entity_id', null, 'inner');
        $collection->joinAttribute('name', 'catalog_product/name', 'entity_id', null, 'inner');
        $collection->joinAttribute('description', 'catalog_product/description', 'entity_id', null, 'inner');
        $collection->joinAttribute('thumbnail', 'catalog_product/thumbnail', 'entity_id', null, 'inner');
        $collection->joinAttribute('url_key', 'catalog_product/url_key', 'entity_id', null, 'inner');
        $collection->addAttributeToFilter('status', ['in' => $this->productStatus->getVisibleStatusIds()])
            ->addAttributeToFilter('visibility', ['in' => $this->productVisibility->getVisibleInSiteIds()]);
        $collection->addAttributeToFilter('name', ['like'=>'%' . $keyword . '%']);
        $collection->addAttributeToFilter('description', ['like'=>'%' . $keyword . '%']);

        return $collection->getData();
    }
}
