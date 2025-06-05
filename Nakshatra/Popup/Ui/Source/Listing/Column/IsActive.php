<?php

namespace Nakshatra\Popup\Ui\Source\Listing\Column;

use Magento\Framework\Data\OptionSourceInterface;

class IsActive implements OptionSourceInterface
{
    private const ENABLED = 1;
    private const DISABLED = 0;
    public function toOptionArray()
    {
        return [
            [
            'value' =>self::DISABLED,
            'label' => __('Disabled'),
            ],
            [
                'value' => self::ENABLED,
                'label' => __('Enabled'),
            ]
        ];
    }
}
