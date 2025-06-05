<?php

namespace Nakshatra\SuperSearch\Controller\Suggest;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Action\HttpGetActionInterface as HttpGetActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;
use Nakshatra\SuperSearch\Block\GetProductImage;
use Nakshatra\SuperSearch\Block\GetProducts;
use Nakshatra\SuperSearch\Block\GetProductUrl;

class ReturnJson extends Action implements HttpGetActionInterface
{
    private $resultJsonFactory;

    private $getProducts;

    public function __construct(
        JsonFactory $resultJsonFactory,
        GetProducts $getProducts,
        GetProductImage $getProductImage,
        GetProductUrl $getProductUrl,
        Context $context
    ) {
        parent::__construct($context);
        $this->getProducts = $getProducts;
        $this->getProductImage = $getProductImage;
        $this->getProductUrl = $getProductUrl;
        $this->resultJsonFactory = $resultJsonFactory;
    }

    public function execute()
    {
        $resultJson = $this->resultJsonFactory->create();
        if (!$this->getRequest()->getParam('q', false)) {
            return $resultJson->setData(['json_data' => 'come from json from if']);
        }
        $data =$this->getProducts->getSearchItems($this->getRequest()->getParam('q'));
        $images = $this->getProductImage->getProductImageUrls($data);
        $urls = $this->getProductUrl->getProductUrl($data);
        foreach ($data as $index => $item) {
            $data[$index]['image'] = $images[$index];
            $data[$index]['url'] = $urls[$index];
        }
        return $resultJson->setData($data);
    }
}
