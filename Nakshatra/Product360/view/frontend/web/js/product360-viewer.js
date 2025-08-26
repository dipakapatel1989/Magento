define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';

    return function (config, element) {
        var $element = $(element);
        var $container = $element.find('.product-360-container');
        var $imageContainer = $element.find('.product-360-image-container');
        var $image = $element.find('.product-360-image');
        var $loading = $element.find('.product-360-loading');
        var $controls = $element.find('.product-360-controls');
        var $playPauseBtn = $element.find('.play-pause-btn');
        var $resetBtn = $element.find('.reset-btn');
        var $fullscreenBtn = $element.find('.fullscreen-btn');
        var $instructions = $element.find('.product-360-instructions');
        var $counter = $element.find('.product-360-counter');

        var images = config.images || [];
        var currentFrame = 0;
        var isLoading = true;
        var isPlaying = false;
        var isDragging = false;
        var isAutoRotating = false;
        var rotationInterval;
        var loadedImages = [];
        var totalFrames = images.length;

        // Configuration
        var autoPlay = config.autoPlay || false;
        var rotationSpeed = config.rotationSpeed || 100;
        var showControls = config.showControls !== false;

        if (totalFrames === 0) {
            $loading.html('<span>' + $t('No 360° images available') + '</span>');
            return;
        }

        // Initialize
        init();

        function init() {
            // Hide default gallery immediately
            hideDefaultGallery();

            preloadImages();
            bindEvents();
            updateCounter();

            if (!showControls) {
                $controls.hide();
            }
        }

        function hideDefaultGallery() {
            // Ensure default gallery is hidden
            $('.gallery-placeholder, [data-gallery-role="gallery-placeholder"], .fotorama, .product-image-main, .product-image-thumbs').hide();
            $('body').addClass('product-360-active');
        }

        function preloadImages() {
            var loadCount = 0;
            loadedImages = new Array(totalFrames);

            images.forEach(function(imageSrc, index) {
                var img = new Image();
                img.onload = function() {
                    loadedImages[index] = img;
                    loadCount++;

                    if (loadCount === totalFrames) {
                        onImagesLoaded();
                    }
                };
                img.onerror = function() {
                    console.error('Failed to load 360° image:', imageSrc);
                    loadCount++;

                    if (loadCount === totalFrames) {
                        onImagesLoaded();
                    }
                };
                img.src = imageSrc;
            });
        }

        function onImagesLoaded() {
            isLoading = false;
            $loading.fadeOut(300);
            $imageContainer.fadeIn(300);
            $instructions.fadeIn(300);

            // Auto-hide instructions after 3 seconds
            setTimeout(function() {
                if (!isDragging && !isAutoRotating) {
                    $instructions.fadeOut(300);
                }
            }, 3000);

            if (autoPlay) {
                setTimeout(function() {
                    startAutoRotation();
                }, 1000);
            }
        }

        function bindEvents() {
            // Mouse events for dragging
            $imageContainer.on('mousedown', function(e) {
                e.preventDefault();
                if (!isLoading) {
                    isDragging = true;
                    stopAutoRotation();
                    $imageContainer.addClass('dragging');
                    $instructions.fadeOut(200);

                    var startX = e.pageX;
                    var startFrame = currentFrame;

                    $(document).on('mousemove.product360', function(e) {
                        if (isDragging) {
                            var deltaX = e.pageX - startX;
                            var sensitivity = 3;
                            var frameChange = Math.floor(deltaX / sensitivity);
                            var newFrame = (startFrame + frameChange) % totalFrames;

                            if (newFrame < 0) {
                                newFrame = totalFrames + newFrame;
                            }

                            setFrame(newFrame);
                        }
                    });

                    $(document).on('mouseup.product360', function() {
                        isDragging = false;
                        $imageContainer.removeClass('dragging');
                        $(document).off('mousemove.product360 mouseup.product360');
                    });
                }
            });

            // Touch events for mobile
            $imageContainer.on('touchstart', function(e) {
                if (!isLoading && e.originalEvent.touches.length === 1) {
                    isDragging = true;
                    stopAutoRotation();
                    $instructions.fadeOut(200);

                    var startX = e.originalEvent.touches[0].pageX;
                    var startFrame = currentFrame;

                    $imageContainer.on('touchmove.product360', function(e) {
                        if (isDragging && e.originalEvent.touches.length === 1) {
                            e.preventDefault();
                            var deltaX = e.originalEvent.touches[0].pageX - startX;
                            var sensitivity = 2;
                            var frameChange = Math.floor(deltaX / sensitivity);
                            var newFrame = (startFrame + frameChange) % totalFrames;

                            if (newFrame < 0) {
                                newFrame = totalFrames + newFrame;
                            }

                            setFrame(newFrame);
                        }
                    });

                    $imageContainer.on('touchend.product360', function() {
                        isDragging = false;
                        $imageContainer.off('touchmove.product360 touchend.product360');
                    });
                }
            });

            // Control buttons
            $playPauseBtn.on('click', function() {
                if (isAutoRotating) {
                    stopAutoRotation();
                } else {
                    startAutoRotation();
                }
            });

            $resetBtn.on('click', function() {
                stopAutoRotation();
                setFrame(0);
            });

            $fullscreenBtn.on('click', function() {
                toggleFullscreen();
            });

            // Keyboard controls
            $(document).on('keydown', function(e) {
                if ($container.is(':visible') && !isLoading) {
                    switch(e.which) {
                        case 37: // Left arrow
                            e.preventDefault();
                            stopAutoRotation();
                            previousFrame();
                            break;
                        case 39: // Right arrow
                            e.preventDefault();
                            stopAutoRotation();
                            nextFrame();
                            break;
                        case 32: // Spacebar
                            e.preventDefault();
                            $playPauseBtn.click();
                            break;
                        case 27: // Escape
                            if (document.fullscreenElement) {
                                exitFullscreen();
                            }
                            break;
                    }
                }
            });

            // Fullscreen change events
            $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
                updateFullscreenButton();
            });
        }

        function setFrame(frame) {
            if (frame >= 0 && frame < totalFrames && images[frame]) {
                currentFrame = frame;
                $image.attr('src', images[frame]);
                updateCounter();
            }
        }

        function nextFrame() {
            var newFrame = (currentFrame + 1) % totalFrames;
            setFrame(newFrame);
        }

        function previousFrame() {
            var newFrame = currentFrame - 1;
            if (newFrame < 0) {
                newFrame = totalFrames - 1;
            }
            setFrame(newFrame);
        }

        function startAutoRotation() {
            if (isLoading) return;

            isAutoRotating = true;
            isPlaying = true;
            $playPauseBtn.find('.play-icon').hide();
            $playPauseBtn.find('.pause-icon').show();
            $container.addClass('auto-rotating');
            $instructions.fadeOut(300);

            rotationInterval = setInterval(function() {
                nextFrame();
            }, rotationSpeed);
        }

        function stopAutoRotation() {
            isAutoRotating = false;
            isPlaying = false;
            $playPauseBtn.find('.play-icon').show();
            $playPauseBtn.find('.pause-icon').hide();
            $container.removeClass('auto-rotating');

            if (rotationInterval) {
                clearInterval(rotationInterval);
                rotationInterval = null;
            }
        }

        function updateCounter() {
            $counter.find('.current-frame').text(currentFrame + 1);
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                enterFullscreen();
            } else {
                exitFullscreen();
            }
        }

        function enterFullscreen() {
            var elem = $container[0];
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }

        function exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        function updateFullscreenButton() {
            if (document.fullscreenElement) {
                $container.addClass('fullscreen');
                $fullscreenBtn.find('.fullscreen-enter').hide();
                $fullscreenBtn.find('.fullscreen-exit').show();
            } else {
                $container.removeClass('fullscreen');
                $fullscreenBtn.find('.fullscreen-enter').show();
                $fullscreenBtn.find('.fullscreen-exit').hide();
            }
        }

        // Cleanup on destroy
        function destroy() {
            stopAutoRotation();
            $(document).off('keydown fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange');
            $imageContainer.off();
            $controls.off();
        }

        // Public API
        return {
            nextFrame: nextFrame,
            previousFrame: previousFrame,
            setFrame: setFrame,
            startAutoRotation: startAutoRotation,
            stopAutoRotation: stopAutoRotation,
            destroy: destroy
        };
    };
});
