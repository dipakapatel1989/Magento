define([
    'jquery',
    'Magento_Ui/js/form/components/group',
    'uiRegistry'
], function ($, Group, uiRegistry) {
    'use strict';

    return Group.extend({
        defaults: {
            template: 'Nakshatra_Product360/form/element/preview',
            images: [],
            currentImageIndex: 0,
            isPlaying: false,
            playInterval: null,
            playSpeed: 200
        },

        initialize: function () {
            this._super();
            this.images = [];
            this.currentImageIndex = 0;
            this.setupListeners();
            return this;
        },

        setupListeners: function () {
            var self = this;

            // Listen for uploader changes
            setTimeout(function() {
                var uploaderComponent = uiRegistry.get(
                    'product_form.product_form.product360-images.product360_uploader'
                );

                if (uploaderComponent) {
                    uploaderComponent.on('value', function(images) {
                        self.updateImages(images);
                    });
                }
            }, 1000);
        },

        updateImages: function (images) {
            this.images = images || [];
            this.currentImageIndex = 0;
            this.stopPreview();
        },

        hasImages: function () {
            return this.images.length > 0;
        },

        getCurrentImage: function () {
            return this.images[this.currentImageIndex] || {};
        },

        getCurrentImageUrl: function () {
            var currentImage = this.getCurrentImage();
            return currentImage.url || currentImage.file || '';
        },

        getImageCount: function () {
            return this.images.length;
        },

        getCurrentPosition: function () {
            return this.currentImageIndex + 1;
        },

        nextImage: function () {
            if (this.images.length === 0) return;
            this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        },

        prevImage: function () {
            if (this.images.length === 0) return;
            this.currentImageIndex = this.currentImageIndex === 0
                ? this.images.length - 1
                : this.currentImageIndex - 1;
        },

        startPreview: function () {
            if (this.images.length <= 1 || this.isPlaying) return;

            var self = this;
            this.isPlaying = true;
            this.playInterval = setInterval(function () {
                self.nextImage();
            }, this.playSpeed);
        },

        stopPreview: function () {
            this.isPlaying = false;
            if (this.playInterval) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
        },

        resetPreview: function () {
            this.stopPreview();
            this.currentImageIndex = 0;
        }
    });
});
