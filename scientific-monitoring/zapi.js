(function($) {
	var zapi, js_plugin_src;

	zapi = {
		defaults: {
			collection     : '',
			user           : '1562960',
			// Number of entries to fetch
			num_entries    : 20,
			start          : 0,
			zotero_options : 'format=atom&content=json,bib&style=apa&order=date&sort=desc'
		},
		collection_name: window.location.pathname.split('/').pop().replace('archive-', '').replace('monitoring-', '').replace('.html', ''),
		// Element cache (careful with using string selectors with this jQuery; it will search the parent DOM)
		$body        : $(document.body),
		$window      : $(window),
		$parent_body : $('body'),
		$footer      : $('.c-back-to-top'),
		tab_height_timeout: '',
		// An array of years of the references (for archive page)
		years : [],
		total : false,
		// Set the correct height of the tab iframe
		fixTabHeight: function() {
			window.clearTimeout(zapi.tab_height_timeout);
			zapi.tab_height_timeout = window.setTimeout(function() {
				// Remove this event listener, adjust height, add back the listener
				zapi.$window.off('resize.tabs');
				// Set height with extra 50px
				window.frameElement.height = zapi.tab_height = zapi.$body.parent().height() + 50;
				// Add back the listener
				window.setTimeout(function() {
					zapi.$window.on('resize.tabs', zapi.fixTabHeight);
				}, 200);
			}, 200);
		},
		buildParams: function(options) {
			var params = $.extend({}, zapi.defaults, options);
			if (options.mode === 'archive') {
				params = zapi.filterParamsArchive(params);
			}
			return params;
		},
		getFeedUrl: function(params) {
			var // The params hash should already be from buildParams
				zapi_url = 'https://api.zotero.org/users/';
			
			// Build the zotero api url
			zapi_url += params.user + '/collections/' + params.collection + '/items?' + params.zotero_options + '&start=' + params.start + '&limit=' + params.num_entries;

			if (params.q) {
				zapi_url += '&q=' + params.q + '&qmode=titleCreatorYear';
			}
			// Build the google feed api url and return it
			return 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num=' + params.num_entries + '&q=' + encodeURIComponent(zapi_url);
		},
		getReferences: function(options, callback) {
			var // Build our params, then get the feed url with those params
				params     = zapi.buildParams(options),
				// Get the google feed api url
				feed_url   = zapi.getFeedUrl(params),
				is_archive = options.mode === 'archive';
			
			// Check if the iframe has our styles yet
			if (!zapi.$body.hasClass('ready')) {
				$(document).find('head').append('<style>#boot .reference-year { margin-top: 20px; } #boot .reference-year:first-child { margin-top: 0; }</style>');
				zapi.$body.addClass('ready');
			}

			// If the spinner markup is not yet in the parent.window DOM, set it up and add styles
			if (zapi.$footer.prev()[0].className !== 'spinner') {
				// First, our styles
				$('head').append('<style>.spinner { display: none; position: absolute; left: 45%; width: 50px; height: 30px; text-align: center; font-size: 10px; } body.loading-references .spinner { display: block; } .spinner > div { background-color: #333; height: 100%; width: 6px; margin: 0 1px; display: inline-block;  -webkit-animation: stretchdelay 1.2s infinite ease-in-out; animation: stretchdelay 1.2s infinite ease-in-out; } .spinner .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .spinner .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .spinner .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .spinner .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% {  transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }</style>');
				// And our markup
				zapi.$footer.before('<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>');
			}
			
			// Add loading references class
			zapi.$parent_body.addClass('loading-references');
			$.ajax({
				url: feed_url,
				dataType: 'jsonp',
				success: function(resp) {
					var // Structure of resp: resp.responseData.feed.entries[]
						$feed    = $($.parseXML(resp.responseData.xmlString)),
						$entries = $feed.find('entry'),
						len      = $entries.length,
						i        = 0,
						ref_html = '',
						filterByType = function(type) {
							return function() {
								return $(this).attr('zapi:type') === type;
							};
						},
						$entry,
						$bib,
						bib_html,
						bib_url_start,
						entry,
						the_year   = '';

					// Check if we have set the total results yet
					if (zapi.total === false) {
						zapi.total = parseInt($feed.find('totalResults').text(), 10);
					}
					for (; i < len; i++) {
						$entry = $($entries[i]);
						// If this selector doesn't work, we need to use a filter function and check attr('zapi:type')
						entry = $.parseJSON($entry.find('subcontent').filter(filterByType('json')).text());
						
						// Archive?
						if (is_archive) {
							the_year = $entry.find('year').text();
							if (zapi.years[zapi.years.length - 1] !== the_year) {
								ref_html += '<h2 class="reference-year" id="year-' + the_year + '">' + the_year + '</h2>';
								zapi.years.push(the_year);
							}
						}
						// Title
						ref_html += '<h6>' + (entry.url ? '<a href="' + entry.url + '" target="_blank">' : '') + entry.title + (entry.url ? '</a>' : '') + '</h6>';

						$bib = $entry.find('subcontent').filter(filterByType('bib')).children('div');
						if ($bib.length) {
							bib_html = $bib[0].outerHTML;
							if (entry.url) {
								bib_url_start = bib_html.lastIndexOf(' from http://');
								if (bib_url_start === -1) {
									bib_url_start = bib_html.lastIndexOf(' from https://');
								}
								if (bib_url_start > 0) {
									bib_url_start = bib_html.lastIndexOf('. Retrieved ');
									bib_html = bib_html.substring(0, bib_url_start + 1) + bib_html.substring(bib_html.indexOf('</div>'));
								}
							}
							ref_html += bib_html;
						}
					}
					callback(ref_html);
					zapi.$parent_body.removeClass('loading-references');
					// When this tab is selected, a resize is triggered; use that opportunity to fix the iframe height
					// And then trigger the logic once right away for the default tab
					zapi.$window.on('resize.tabs', zapi.fixTabHeight).trigger('resize.tabs');
					
					// If we have not yet loaded all the references and it is an archive, add a handler to the parent window to load the next set of results
					if (is_archive && params.start + params.num_entries < zapi.total) {
						params.start += params.num_entries;
						// Make sure resize.tabs has had a chance to do its magic by attaching waypoint after 500 ms
						window.setTimeout(function() {
							zapi.$footer.on('inview.' + zapi.collection_name, function() {
								// Is the current active tab this one?
								if ($('.tab-pane.active').attr('id') !== zapi.collection_name) {
									return;
								}
								// It is the current tab, so remove this handler and get the next set of references
								zapi.$footer.off('inview.' + zapi.collection_name);
								zapi.getReferences(params, callback);
							});
						}, 500);
					}
				}
			});
		},
		filterParamsArchive: function(params) {
			if (!params.start) {
				// Default to 20
				params.start = 20;
				params.num_entries = 50;
			}
			return params;
		}
	};

	// Suggested approach
	// 1. Parse responseData.xmlString of response into a document tree and wrap it with jQuery
	// var $resp = $($.parseXML(resp.responseData.xmlString));
	// 2. Loop through the entries using .each(); if necessary, fall back to the JSON using resp.responseData.feed.entries[idx] (shouldn't be necessary)
	// $resp.find('entry').each(function(idx) {});

	// Export our Zotero API handler
	window.zotero_api = zapi;
	
	// Attach jquery.inview to parent if not yet attached
	if ($.event.special.inview === undefined) {
		js_plugin_src = window.location.href.split('/');
		js_plugin_src.pop();
		js_plugin_src.push('jquery.inview.min.js');
		zapi.$parent_body.append('<script src="' + js_plugin_src.join('/') + '"><\/script>');
	}
})(window.jQuery || window.parent.jQuery);
