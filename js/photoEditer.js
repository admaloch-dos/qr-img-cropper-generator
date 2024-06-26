$(function () {
	'use strict';
	let console = window.console || { log: function () { } };
	let $image = $('#image');
	let $download = $('#download');
	let $dataX = $('#dataX');
	let $dataY = $('#dataY');
	let $dataHeight = $('#dataHeight');
	let $dataWidth = $('#dataWidth');
	let $dataRotate = $('#dataRotate');
	let $dataScaleX = $('#dataScaleX');
	let $dataScaleY = $('#dataScaleY');
	let options = {
		aspectRatio: 1 / 1,
		preview: '.img-preview',
		crop: function (e) {
			$dataX.val(Math.round(e.x));
			$dataY.val(Math.round(e.y));
			$dataHeight.val(Math.round(e.height));
			$dataWidth.val(Math.round(e.width));
			$dataRotate.val(e.rotate);
			$dataScaleX.val(e.scaleX);
			$dataScaleY.val(e.scaleY);
		}
	};
	let qrDelay;

	// Tooltip
	$('[data-toggle="tooltip"]').tooltip();

	// Cropper
	$image.on({
		'build.cropper': function (e) {
			// console.log(e.type);
		},
		'built.cropper': function (e) {
			// console.log(e.type);
		},
		'cropstart.cropper': function (e) {
			// console.log(e.type, e.action);
		},
		'cropmove.cropper': function (e) {
			// console.log(e.type, e.action);
		},
		'cropend.cropper': function (e) {
			// console.log(e.type, e.action);
		},
		'crop.cropper': function (e) {
			const genQrBtn = document.getElementById('gen-cropped-img');
			let clickOccurred = false;
			clearTimeout(qrDelay)
			qrDelay = setTimeout(() => {
				if (!clickOccurred) {
					genQrBtn.click();
					clickOccurred = true;
				}
			}, 100);
		},
		'zoom.cropper': function (e) {
			// console.log(e.type, e.ratio);
		}
	}).cropper(options);

	// Buttons
	if (!$.isFunction(document.createElement('canvas').getContext)) {
		$('button[data-method="getCroppedCanvas"]').prop('disabled', true);
	}

	if (typeof document.createElement('cropper').style.transition === 'undefined') {
		$('button[data-method="rotate"]').prop('disabled', true);
		$('button[data-method="scale"]').prop('disabled', true);
	}

	// Options
	$('.docs-toggles').on('change', 'input', function () {
		let $this = $(this);
		let name = $this.attr('name');
		let type = $this.prop('type');
		let cropBoxData;
		let canvasData;
		if (!$image.data('cropper')) {
			return;
		}
		if (type === 'checkbox') {
			options[name] = $this.prop('checked');
			cropBoxData = $image.cropper('getCropBoxData');
			canvasData = $image.cropper('getCanvasData');

			options.built = function () {
				$image.cropper('setCropBoxData', cropBoxData);
				$image.cropper('setCanvasData', canvasData);
			};
		} else if (type === 'radio') {
			options[name] = $this.val();
		}
		$image.cropper('destroy').cropper(options);
	});

	// Methods
	$('.docs-buttons').on('click', '[data-method]', function () {
		let $this = $(this);
		let data = $this.data();
		let $target;
		let result;
		if ($this.prop('disabled') || $this.hasClass('disabled')) {
			return;
		}
		if ($image.data('cropper') && data.method) {
			data = $.extend({}, data); // Clone a new one
			if (typeof data.target !== 'undefined') {
				$target = $(data.target);
				if (typeof data.option === 'undefined') {
					try {
						data.option = JSON.parse($target.val());
					} catch (e) {
						console.log(e.message);
					}
				}
			}
			if (data.method === 'rotate') {
				$image.cropper('clear');
			}
			result = $image.cropper(data.method, data.option, data.secondOption);
			if (data.method === 'rotate') {
				$image.cropper('crop');
			}
			switch (data.method) {
				case 'scaleX':
				case 'scaleY':
					$(this).data('option', -data.option);
					break;
				case 'getCroppedCanvas':
					if (result) {
						if (!$download.hasClass('disabled')) {
							$download.attr('href', result.toDataURL('image/jpeg'));
							qrImg = result.toDataURL('image/jpeg')

							makeQArt(qrUrl, qrImg)
						}
					}
					break;
			}
			if ($.isPlainObject(result) && $target) {
				try {
					$target.val(JSON.stringify(result));
				} catch (e) {
					console.log(e.message);
				}
			}
		}
	});

	// Keyboard
	$(document.body).on('keydown', function (e) {
		if (!$image.data('cropper') || this.scrollTop > 300) {
			return;
		}
		switch (e.which) {
			case 37:
				e.preventDefault();
				$image.cropper('move', -1, 0);
				break;

			case 38:
				e.preventDefault();
				$image.cropper('move', 0, -1);
				break;

			case 39:
				e.preventDefault();
				$image.cropper('move', 1, 0);
				break;

			case 40:
				e.preventDefault();
				$image.cropper('move', 0, 1);
				break;
		}
	});

	// Import image
	let $inputImage = $('#inputImage');
	let URL = window.URL || window.webkitURL;
	let blobURL;
	// console.log($inputImage[0])
	if (URL) {
		$inputImage.change(function () {
			let files = this.files;
			let file;

			if (!$image.data('cropper')) {
				return;
			}

			if (files && files.length) {
				file = files[0];
				if (/^image\/\w+$/.test(file.type)) {
					blobURL = URL.createObjectURL(file);
					$image.one('built.cropper', function () {

						// Revoke when load complete
						URL.revokeObjectURL(blobURL);
					}).cropper('reset').cropper('replace', blobURL);
					$inputImage.val('');
				} else {
					window.alert('Please choose an image file.');
				}
			}
		});
	} else {
		$inputImage.prop('disabled', true).parent().addClass('disabled');
	}
});