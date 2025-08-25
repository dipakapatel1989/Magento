define([
    'Magento_Ui/js/form/element/file-uploader',
    'jquery',
    'mage/url'
], function (FileUploader, $, urlBuilder) {
    'use strict';

    return FileUploader.extend({
        defaults: {
            previewTmpl: 'Nakshatra_Product360/form/element/uploader/preview',
            allowedExtensions: 'jpg jpeg gif png JPG JPEG GIF PNG',
            maxFileSize: 2097152,
            isMultipleFiles: true,
            placeholderType: 'image',
            saveUrl: null,
            productId: null,
            autoUpload: false
        },

        initialize: function () {
            this._super();
            this.observe([
                'totalFiles',
                'uploadedFiles',
                'isDragover',
                'isSaving',
                'saveSuccess'
            ]);

            // Initialize observables
            this.totalFiles(0);
            this.uploadedFiles(0);
            this.isDragover(false);
            this.isSaving(false);
            this.saveSuccess(false);

            // Set save URL if not provided
            if (!this.saveUrl) {
                this.saveUrl = urlBuilder.build('product360/image/save');
            }

            // Get product ID from URL or form
            this.getProductId();

            // Setup drag and drop
            this.setupDragAndDrop();

            return this;
        },

        getProductId: function() {
            if (!this.productId) {
                // Try multiple sources for product ID
                var sources = [
                    // From URL parameters
                    function() {
                        var urlParams = new URLSearchParams(window.location.search);
                        return urlParams.get('id');
                    },
                    // From form data
                    function() {
                        var form = $('[data-ui-id="product-form"]');
                        if (form.length) {
                            var entityId = form.find('input[name="product[entity_id]"]').val();
                            if (entityId) return entityId;
                        }
                        return null;
                    },
                    // From page URL
                    function() {
                        var matches = window.location.pathname.match(/\/id\/(\d+)/);
                        return matches && matches[1] ? matches[1] : null;
                    }
                ];

                for (var i = 0; i < sources.length; i++) {
                    var productId = sources[i]();
                    if (productId) {
                        this.productId = productId;
                        console.log('Product ID found:', this.productId);
                        break;
                    }
                }

                if (!this.productId) {
                    console.warn('Product ID not found');
                }
            }
        },

        setupDragAndDrop: function() {
            var self = this;
            var dropArea = $('.file-uploader-button-container');

            if (dropArea.length) {
                dropArea.on('dragover dragenter', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.isDragover(true);
                });

                dropArea.on('dragleave dragend drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.isDragover(false);
                });

                dropArea.on('drop', function(e) {
                    var files = e.originalEvent.dataTransfer.files;
                    if (files && files.length > 0) {
                        self.processFiles(files);
                    }
                });
            }
        },

        onFilesChoosen: function (e) {
            this.saveSuccess(false); // Reset success message

            if (!e || !e.target) {
                console.error('Invalid event object in onFilesChoosen');
                return;
            }

            var files = e.target.files;
            if (!files || files.length === 0) {
                console.log('No files selected');
                return;
            }

            this.processFiles(files);
        },

        processFiles: function(files) {
            console.log('Processing files:', files.length);

            try {
                // Sort files by name for consistent ordering
                var sortedFiles = Array.from(files).sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });

                this.totalFiles(sortedFiles.length);
                this.uploadedFiles(0);

                // Process each file
                for (var i = 0; i < sortedFiles.length; i++) {
                    this.addFile(sortedFiles[i]);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                this.error('Error processing files: ' + error.message);
            }
        },

        addFile: function (file) {
            console.log('Adding file:', file.name);

            // Validate file
            if (!this.isFileAllowed(file)) {
                console.error('File type not allowed:', file.name);
                this.error('File type not allowed: ' + file.name);
                return;
            }

            if (file.size > this.maxFileSize) {
                console.error('File too large:', file.name, file.size);
                this.error('File too large: ' + file.name + ' (max: ' + this.formatFileSize(this.maxFileSize) + ')');
                return;
            }

            // Create file record
            this.createFileRecord(file);
        },

        createFileRecord: function(file) {
            var self = this;
            var fileRecord = {
                file: file,
                name: file.name,
                size: file.size,
                status: 'new',
                uploading: false,
                error: null
            };

            // Create preview URL for images
            if (file.type && file.type.startsWith('image/')) {
                try {
                    fileRecord.previewUrl = URL.createObjectURL(file);
                } catch (e) {
                    console.warn('Could not create preview URL:', e);
                }
            }

            // Add to current values
            var currentValue = this.value() || [];
            currentValue.push(fileRecord);
            this.value(currentValue);
            this.uploadedFiles(this.value().length);

            console.log('File record created:', fileRecord.name);
        },

        removeFile: function (file) {
            try {
                // Clean up preview URL if it exists
                if (file.previewUrl) {
                    URL.revokeObjectURL(file.previewUrl);
                }

                // Remove from value array
                var currentValue = this.value() || [];
                var index = currentValue.indexOf(file);
                if (index > -1) {
                    currentValue.splice(index, 1);
                    this.value(currentValue);
                }

                this.uploadedFiles(this.value().length);
                this.saveSuccess(false); // Reset success message when files change

                console.log('File removed:', file.name);
            } catch (error) {
                console.error('Error removing file:', error);
            }
        },

        saveImages: function() {
            var self = this;
            var images = this.value();

            console.log('Starting save process with images:', images);

            if (!images || images.length === 0) {
                this.error('No images to save');
                return;
            }

            if (!this.productId) {
                this.getProductId(); // Try to get it again
                if (!this.productId) {
                    this.error('Product ID is required to save images');
                    return;
                }
            }

            this.isSaving(true);
            this.error('');
            this.saveSuccess(false);

            var formData = new FormData();
            formData.append('product_id', this.productId);
            formData.append('form_key', window.FORM_KEY);

            // Process and validate images
            var validImages = [];
            images.forEach(function(image, index) {
                console.log('Processing image for save:', index, {
                    name: image.name,
                    hasFile: !!(image.file),
                    fileType: image.file ? image.file.type : 'none',
                    fileSize: image.file ? image.file.size : 0,
                    status: image.status
                });

                if (image.file && image.file instanceof File) {
                    validImages.push({
                        image: image,
                        index: index
                    });

                    // Append the actual file
                    formData.append('product360_images[' + index + ']', image.file);

                    // Append metadata
                    formData.append('image_metadata[' + index + '][name]', image.name || image.file.name);
                    formData.append('image_metadata[' + index + '][sort_order]', index);
                    formData.append('image_metadata[' + index + '][is_active]', true);

                    console.log('Added to FormData:', image.file.name, 'Size:', image.file.size);
                } else {
                    console.warn('Skipping invalid image at index', index, '- no valid file object');
                }
            });

            if (validImages.length === 0) {
                this.error('No valid image files found to save');
                this.isSaving(false);
                return;
            }

            console.log('Sending request with', validImages.length, 'files to:', this.saveUrl);

            // Log FormData contents for debugging
            for (var pair of formData.entries()) {
                console.log('FormData entry:', pair[0], typeof pair[1] === 'object' ? 'File: ' + pair[1].name : pair[1]);
            }

            $.ajax({
                url: this.uploaderConfig.url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            var percentComplete = (e.loaded / e.total) * 100;
                            console.log('Upload progress:', percentComplete.toFixed(2) + '%');
                        }
                    }, false);
                    return xhr;
                },
                success: function(response) {
                    self.isSaving(false);
                    console.log('Server response:', response);

                    if (response && response.success) {
                        console.log('Images saved successfully');
                        self.saveSuccess(true);
                        self.trigger('product360:images:saved', response);

                        // Update file statuses
                        var currentImages = self.value();
                        currentImages.forEach(function(image) {
                            if (image.file instanceof File) {
                                image.status = 'saved';
                            }
                        });
                        self.value(currentImages);

                        // Hide success message after 5 seconds
                        setTimeout(function() {
                            self.saveSuccess(false);
                        }, 5000);
                    } else {
                        var errorMessage = '';
                        if (response && response.message) {
                            errorMessage = response.message;
                        } else if (response && response.error) {
                            errorMessage = response.error;
                        } else {
                            errorMessage = 'Save failed - unknown error';
                        }

                        console.error('Save failed:', errorMessage);
                        self.error(errorMessage);
                    }
                },
                error: function(xhr, status, error) {
                    self.isSaving(false);
                    console.error('AJAX request failed:', {
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        xhr: xhr
                    });

                    var errorMessage = 'Failed to save images: ' + error;
                    if (xhr.responseText) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            if (response.message) {
                                errorMessage = response.message;
                            }
                        } catch (e) {
                            // responseText is not JSON
                            if (xhr.responseText.length < 200) {
                                errorMessage += ' (' + xhr.responseText + ')';
                            }
                        }
                    }

                    self.error(errorMessage);
                }
            });
        },

        onFileUploaded: function (file) {
            try {
                this.uploadedFiles(this.value().length);
                console.log('File processed:', file.name);
            } catch (error) {
                console.error('Error in onFileUploaded:', error);
            }
        },

        isFileAllowed: function (file) {
            if (!file || !file.name) {
                return false;
            }

            var allowedTypes = this.allowedExtensions.toLowerCase().split(' ');
            var fileExtension = file.name.split('.').pop().toLowerCase();
            var isAllowed = allowedTypes.indexOf(fileExtension) !== -1;

            console.log('File validation:', {
                fileName: file.name,
                extension: fileExtension,
                allowedTypes: allowedTypes,
                isAllowed: isAllowed
            });

            return isAllowed;
        },

        getUploadProgress: function () {
            if (this.totalFiles() === 0) return 0;
            return Math.round((this.uploadedFiles() / this.totalFiles()) * 100);
        },

        formatFileSize: function (bytes) {
            if (!bytes || bytes === 0) return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        getAcceptedTypes: function () {
            return this.allowedExtensions.toLowerCase().split(' ')
                .map(function(ext) { return '.' + ext; })
                .join(',');
        },

        clearAllFiles: function() {
            var self = this;
            var currentFiles = this.value() || [];

            // Clean up preview URLs
            currentFiles.forEach(function(file) {
                if (file.previewUrl) {
                    URL.revokeObjectURL(file.previewUrl);
                }
            });

            // Clear all data
            this.value([]);
            this.totalFiles(0);
            this.uploadedFiles(0);
            this.error('');
            this.saveSuccess(false);

            // Clear file input
            var input = document.getElementById('file-uploader-input');
            if (input) {
                input.value = '';
            }

            console.log('All files cleared');
        },

        // Clean up when component is destroyed
        destroy: function() {
            var currentFiles = this.value() || [];
            currentFiles.forEach(function(file) {
                if (file.previewUrl) {
                    URL.revokeObjectURL(file.previewUrl);
                }
            });
            this._super();
        }
    });
});
