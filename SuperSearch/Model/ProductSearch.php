<?php

namespace Nakshatra\SuperSearch\Model;

use Nakshatra\SuperSearch\Api\ProductSearchInterface;

class ProductSearch implements ProductSearchInterface
{
    /**
     * Returns search product data
     *
     * @return array
     */
    public function getProducts(): array
    {
        $data[] = "Rest API works fine.";
        return $data;
    }
}
