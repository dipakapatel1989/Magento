<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Ui\DataProvider\Product\Form\Modifier;

use Magento\Catalog\Model\Locator\LocatorInterface;
use Magento\Catalog\Ui\DataProvider\Product\Form\Modifier\AbstractModifier;
use Magento\Framework\Stdlib\ArrayManager;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use Nakshatra\Product360\Api\Product360ImageRepositoryInterface;
use Psr\Log\LoggerInterface;


class Product360Images extends AbstractModifier
{
    private LocatorInterface $locator;
    private ArrayManager $arrayManager;
    private UrlInterface $urlBuilder;
    private StoreManagerInterface $storeManager;
    private Product360ImageRepositoryInterface $product360ImageRepository;
    private LoggerInterface $logger;


    const DATA_SCOPE_PRODUCT360 = 'product360_images';
    const GROUP_PRODUCT360 = 'product360-images';

    public function __construct(
        LocatorInterface $locator,
        ArrayManager $arrayManager,
        UrlInterface $urlBuilder,
        StoreManagerInterface $storeManager,
        Product360ImageRepositoryInterface $product360ImageRepository,
        LoggerInterface $logger


    ) {
        $this->locator = $locator;
        $this->arrayManager = $arrayManager;
        $this->urlBuilder = $urlBuilder;
        $this->storeManager = $storeManager;
        $this->product360ImageRepository = $product360ImageRepository;
        $this->logger = $logger;

    }

    public function modifyData(array $data): array
    {
        $product = $this->locator->getProduct();
        $productId = (int)$product->getId();

        if ($productId) {
            $images = $this->product360ImageRepository->getByProductId($productId);
            $imageData = [];

            foreach ($images as $image) {
                $imageData[] = [
                    'entity_id' => $image->getId(),
                    'file' => $image->getImagePath(),
                    'sort_order' => $image->getSortOrder(),
                    'is_active' => $image->getIsActive(),
                    'url' => $this->getImageUrl($image->getImagePath()),
                    'name' => basename($image->getImagePath()),
                    'size' => 0, // Will be populated by file uploader
                    'type' => 'image'
                ];
            }

            // Set the data structure that the uploader expects
            $data[$productId][self::DATA_SCOPE_PRODUCT360] = $imageData;

            // Set the data for the form
            $data[$productId]['product']['product360_images'] = $imageData;
            $this->logger->info('Product360Images Modifier - Data prepared:', [
                'product_id' => $productId,
                'image_count' => count($imageData)
            ]);
        }

        $this->logger->info('Product360Images Modifier - Data:', $data);

        return $data;
    }

    public function modifyMeta(array $meta): array
    {
        $meta = $this->createProduct360Tab($meta);
        return $meta;
    }

    protected function createProduct360Tab(array $meta): array
    {
        return $this->arrayManager->set(
            self::GROUP_PRODUCT360,
            $meta,
            [
                'arguments' => [
                    'data' => [
                        'config' => [
                            'label' => __('360° Images'),
                            'componentType' => 'fieldset',
                            'dataScope' => '',
                            'collapsible' => true,
                            'sortOrder' => 25,
                            'opened' => false,
                            'canShow' => true,
                            'ns' => 'product_form'
                        ]
                    ]
                ],
                'children' => $this->getProduct360Fields()
            ]
        );
    }

    protected function getProduct360Fields(): array
    {
        return [
            self::DATA_SCOPE_PRODUCT360 => [
                'arguments' => [
                    'data' => [
                        'config' => [
                            'componentType' => 'fileUploader',
                            'component' => 'Nakshatra_Product360/js/form/element/file-uploader',
                            'template' => 'ui/form/field',
                            'elementTmpl' => 'Nakshatra_Product360/form/element/uploader/uploader',
                            'previewTmpl' => 'Nakshatra_Product360/form/element/uploader/preview',
                            'formElement' => 'fileUploader',
                            'dataType' => 'string',
                            'label' => __('Upload 360° Images'),
                            'sortOrder' => 10,
                            'dataScope' => self::DATA_SCOPE_PRODUCT360,
                            'validation' => [
                                'required-entry' => false
                            ],
                            'notice' => __(
                                'Upload images in sequence for smooth 360° rotation. ' .
                                'Recommended: 24-36 images for optimal experience.'
                            ),
                            'uploaderConfig' => [
                                'url' => $this->urlBuilder->getUrl('product360/image/upload'),
                            ],
                            'allowedExtensions' => 'jpg jpeg gif png webp',
                            'maxFileSize' => 2097152,
                            'isMultipleFiles' => true,
                            'placeholderType' => 'image'
                        ]
                    ]
                ]
            ]
        ];
    }

    private function getImageUrl(string $imagePath): string
    {
        return $this->storeManager->getStore()
                ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA) . 'product360/' . $imagePath;
    }
}
