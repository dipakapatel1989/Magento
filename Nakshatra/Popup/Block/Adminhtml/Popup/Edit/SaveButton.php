<?php
declare(strict_types=1);
namespace Nakshatra\Popup\Block\Adminhtml\Popup\Edit;

use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

class SaveButton extends GenericButton implements ButtonProviderInterface
{
    public function getButtonData()
    {
        return [
            'label' => __('Save'),
            'class' => 'save primary',
            'data_attribute' => [
                'mage-init' => [
                    'buttonAdapter' => [
                        'actions' => [
                            [
                                'targetName' => 'nakshatra_popup_form.nakshatra_popup_form',
                                'actionName' => 'save',
                            ]
                        ]
                    ]
                ]
            ],
        ];
    }
}
