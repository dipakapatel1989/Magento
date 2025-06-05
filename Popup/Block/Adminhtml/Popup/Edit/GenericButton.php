<?php

declare(strict_types=1);

namespace Nakshatra\Popup\Block\Adminhtml\Popup\Edit;

use Magento\Backend\Block\Widget\Context;
use Magento\Cms\Api\BlockRepositoryInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\UrlInterface;

class GenericButton
{
    /**
     * @var BlockRepositoryInterface
     */
    protected $blockRepository;

    /**
     * @param UrlInterface $url
     * @param RequestInterface $request
     */
    public function __construct(
        private readonly UrlInterface $url,
        private readonly RequestInterface $request
    ) { }

    /**
     * @return int
     */

    public function getPopupId()
    {
        return (int) $this->request->getParam('popup_id',0);
    }

    /**
     * @param string $route
     * @param array $params
     * @return string
     */
    public function getUrl(string $route = '', array $params = []): string
    {
        return $this->url->getUrl($route, $params);
    }
}
