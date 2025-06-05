<?php declare(strict_types=1);

namespace Nakshatra\Popup\Api;

use Nakshatra\Popup\Api\Data\PopupInterface;

interface PopupRepositoryInterface
{
    /**
     * @param PopupInterface $popup
     * @return void
     */

    public function save(PopupInterface $popup): void;

    /**
     * @param PopupInterface $popup
     * @return void
     */
    public function delete(PopupInterface $popup): void;

    /**
     * @param int $popupId
     * @return PopupInterface
     */
    public function getById(int $popupId): PopupInterface;
}
