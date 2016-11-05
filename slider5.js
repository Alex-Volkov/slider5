/**
 * Created by Aleksandr Volkov on 05/11/2016.
 */
;(function ($) {
	var methods = {
		init: function (options) {
			return this.each(function () {
				var that = this,
					$this = $(this),
					settings = {
						elemCount: 5,
						baseFontSize: 8,
						initHeight: 25,
						initWidth: 50,
						widthStep: 20,
						evenX: 80,
						oddX: 10,
						evenXIncrement: 60,
						oddXIncrement: 20,
						evenY: 10,
						oddY: 30,
						evenYIncrement: 50,
						oddYIncrement: 30,
						slideTemplate: '<div class="slide" id="slide{{slideId}}"></div>',
						elemTemplate: '<div class="control">\
						<div class="inner-wrapper">\
						<div class="move-left move-block"><span class="glyphicon glyphicon-chevron-left"></span></div>\
						<div class="video">\
						<video>\
						<source src="/assets/sample.mp4" type="video/mp4">\
						</video>\
						<div class="play-pause "><span class="glyphicon glyphicon-play-circle play-button"></span></div>\
						</div>\
						<div class="move-right move-block"><span class="glyphicon glyphicon-chevron-right"></span></div>\
						<div class="inner-block"></div>\
						</div></div>;',
						$elements: [],
						position: []
					};
				// overriding default values
				$.extend(settings, options);
				_.templateSettings = {
					interpolate: /\{\{(.+?)\}\}/g
				};
				if (!!settings.elems && settings.elems.length) {
					settings.elemCount = settings.elems.length
				}
				settings.initFontSize = (16 - settings.baseFontSize) / settings.elemCount;
				settings.initOpacity = 1 / settings.elemCount;
				settings.currentOpacity = settings.initOpacity;
				settings.currentFontSize = settings.initFontSize;
				settings.heightStep = (100 - settings.initHeight) / settings.elemCount;

				settings.position.length = 7;
				for (var cnt = 0; cnt < settings.position.length; cnt++) {
					settings.position[cnt] = {};
				}
				var createElements = function () {
						var template = _.template(settings.elemTemplate);
						for (var cnt = 0; cnt < settings.elemCount; cnt++) {
							settings.$elements
								.push($(template(settings.elems[cnt]))
										.appendTo($this)
										.attr('data-id', cnt + 1)
										.attr('data-slide-id', settings.elems[cnt].slideId)
										.attr('data-position', cnt + 1)

									//.find('.inner-block')
									//.text('elem ' + parseInt(cnt + 1))
									//.end()
								);
						}
						// creating slides
						if(!!settings.images && !!settings.containerSelector){
							var slide = settings.slideTemplate;
							var $slides = $(settings.containerSelector);
							_.each(settings.images, function(image, index){
								var $slide = $(slide.replace('{{slideId}}', (index + 1)))
								$slide
									.css({backgroundImage: 'url(' + image + ')'})
									.appendTo($slides);
								if(index === settings.images.length -1){
									$slide.addClass('active')
								}

							})
						}
					},
					setDimensions = function ($elem, index) {
						//$elem.data('position', parseInt(index) + 1);
						$elem.css({
							left: settings.position[index - 1].x,
							top: settings.position[index - 1].y,
							width: settings.position[index - 1].width,
							height: settings.position[index - 1].height,
							opacity: settings.position[index - 1].opacity,
							fontSize: settings.baseFontSize + settings.position[index - 1].fontSize,
							lineHeight: (settings.baseFontSize + settings.position[index - 1].fontSize) / 2 + 'px',
							zIndex: index
						})
							.find('h2').css({fontSize: settings.baseFontSize + settings.position[index - 1].fontSize});

						//console.log($elem);
					},
					newStack = function (position) {
						var res = [],
							counter = position;
						while (counter < settings.elemCount) {
							res.push(counter + 1);
							counter++;
						}
						counter = 0;
						while (counter < position) {
							res.push(counter + 1);
							counter++;
						}
						return res;
					};
				createElements();
				settings.position.forEach(function (elem, index) {
					elem.opacity = settings.currentOpacity;
					elem.fontSize = settings.currentFontSize;
					elem.height = settings.initHeight;
					elem.width = settings.initWidth;
					settings.currentOpacity += settings.initOpacity;
					settings.currentFontSize += settings.initFontSize;
					settings.initHeight += settings.heightStep;
					settings.initWidth += settings.widthStep;
					//even
					if ((index + 1) / 2 == parseInt((index + 1) / 2)) {
						elem.x = settings.evenX;
						settings.evenX = settings.evenX + settings.evenXIncrement + 5 * index;
						elem.y = settings.evenY;
						settings.evenY = settings.evenY + settings.evenYIncrement;
					} else { // odd
						elem.x = settings.oddX;
						elem.y = settings.oddY;
						settings.oddX = settings.oddX + settings.oddXIncrement + 5 * index;
						settings.oddY = settings.oddY + settings.oddYIncrement + 5 * index;
					}
				});
				var processElement = function (elem, elemId) {
					if (!elemId) {
						elemId = elem.attr('data-id');
					}
					$('.slide').removeClass('active');
					$('#' + elem.attr('data-slide-id')).addClass('active');
					settings.$elements.forEach(function (elem) {
						elem.removeClass('on-top');
					});
					elem.addClass('on-top');
					// move element to the top
					//                setDimensions($this, position.length);
					var stack = newStack(elemId);
					stack.forEach(function (elem, index) {
						setDimensions(settings.$elements[elem - 1], index + 1);
					});
				};
				settings.$elements.forEach(function (elem, index) {
					var id = elem.attr('data-position');
					setDimensions(elem, id);
					if (index == settings.elemCount - 1) {
						elem.addClass('on-top');
					}
					elem
					// selecting slide
						.on('click', function () {
							var $this = $(this),
								id = $this.data('id'),
								position = $this.data('position');
							processElement($this, id);
						})
						.find('.move-left').on('click', function (e) {
						var elemId = $(e.target).closest('.control').attr('data-id'),
							nextId = elemId > 1 ? elemId - 1 : settings.elemCount;
						processElement(settings.$elements[nextId - 1], nextId);
						return false;
					})
						.end()
						.find('.move-right').on('click', function (e) {
						var elemId = $(e.target).closest('.control').attr('data-id'),
							nextId = elemId < settings.elemCount ? parseInt(elemId) + 1 : 1;
						processElement(settings.$elements[nextId - 1], nextId);
						return false;
					});
					elem
					// playing video
						.find('.video .play-button')
						.on('click', function (e) {
							var $target = $(e.target),
								video = $target.closest('.play-pause').siblings('video')[0];
							$target
								.toggleClass('glyphicon-record')
								.toggleClass('glyphicon-play-circle');
							video.paused ? video.play() : video.pause();
						})
				})
			})
		},
		destroy: function () {

		}
	};
	$.fn.html5Slider = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.html5Slider');
		}
	};
})(jQuery);
