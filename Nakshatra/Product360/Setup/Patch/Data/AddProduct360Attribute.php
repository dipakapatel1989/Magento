<?php
declare(strict_types=1);

namespace Nakshatra\Product360\Setup\Patch\Data;

use Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface;
use Magento\Eav\Setup\EavSetup;
use Magento\Eav\Setup\EavSetupFactory;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\Patch\DataPatchInterface;
use Magento\Catalog\Model\Product;

class AddProduct360Attribute implements DataPatchInterface
{
    private ModuleDataSetupInterface $moduleDataSetup;
    private EavSetupFactory $eavSetupFactory;

    public function __construct(
        ModuleDataSetupInterface $moduleDataSetup,
        EavSetupFactory $eavSetupFactory
    ) {
        $this->moduleDataSetup = $moduleDataSetup;
        $this->eavSetupFactory = $eavSetupFactory;
    }

    public static function getDependencies(): array
    {
        return [];
    }

    public function getAliases(): array
    {
        return [];
    }

    public function apply(): DataPatchInterface
    {
        $this->moduleDataSetup->getConnection()->startSetup();

        /** @var EavSetup $eavSetup */
        $eavSetup = $this->eavSetupFactory->create(['setup' => $this->moduleDataSetup]);

        // Check if attribute already exists to avoid duplicate creation
        if (!$eavSetup->getAttribute(Product::ENTITY, 'enable_360_view')) {
            $eavSetup->addAttribute(
                Product::ENTITY,
                'enable_360_view',
                [
                    'type' => 'int',
                    'label' => 'Enable 360° View',
                    'input' => 'boolean',
                    'source' => \Magento\Eav\Model\Entity\Attribute\Source\Boolean::class,
                    'required' => false,
                    'default' => '0',
                    'sort_order' => 100,
                    'global' => ScopedAttributeInterface::SCOPE_STORE,
                    'used_in_product_listing' => false,
                    'visible_on_front' => false,
                    'is_used_in_grid' => true,
                    'is_visible_in_grid' => false,
                    'is_filterable_in_grid' => true,
                ]
            );

            // Add attribute to existing Images group in all attribute sets
            $entityTypeId = $eavSetup->getEntityTypeId(Product::ENTITY);
            $attributeId = $eavSetup->getAttributeId($entityTypeId, 'enable_360_view');

            // Get all product attribute sets
            $attributeSets = $eavSetup->getAllAttributeSetIds($entityTypeId);

            foreach ($attributeSets as $attributeSetId) {
                // Check if Images group exists, if not create it
                $groupId = $eavSetup->getAttributeGroupId($entityTypeId, $attributeSetId, 'Images');

                if (!$groupId) {
                    $eavSetup->addAttributeGroup($entityTypeId, $attributeSetId, 'Images', 4);
                    $groupId = $eavSetup->getAttributeGroupId($entityTypeId, $attributeSetId, 'Images');
                }

                // Add attribute to the Images group
                $eavSetup->addAttributeToGroup(
                    $entityTypeId,
                    $attributeSetId,
                    $groupId,
                    $attributeId,
                    100
                );
            }
        }

        $this->moduleDataSetup->getConnection()->endSetup();

        return $this;
    }
}
