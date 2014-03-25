(function($) {
	var zapi;

	zapi = {
		defaults: {
			collection     : '',
			user           : '1562960',
			// Number of entries to fetch
			num_entries    : 20,
			zotero_options : 'format=atom&content=json,bib&style=apa&order=date&sort=desc'
		},
		getFeedUrl: function(options) {
			var // Merge options with defaults and build url
				params   = $.extend({}, zapi.defaults, options),
				zapi_url = 'https://api.zotero.org/users/';

			// Build the zotero api url
			zapi_url += params.user + '/collections/' + params.collection + '/items?' + params.zotero_options + '&limit=' + params.num_entries;

			if (params.start) {
				zapi_url += '&start=' + params.start;
			}
			if (params.q) {
				zapi_url += '&q=' + params.q + '&qmode=titleCreatorYear';
			}
			// Build the google feed api url and return it
			return 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json_xml&num=' + params.num_entries + '&q=' + encodeURIComponent(zapi_url);
		},
		getReferences: function(options, callback) {
			var // Get the google feed api url
				feed_url     = zapi.getFeedUrl(options),
				// Careful with using selectors with the jQuery object; it will search the parent DOM, not this one
				$body        = $(document.body),
				fixTabHeight = function() {
					window.frameElement.height = $body.parent().height();
				},
				tab_height_timeout;

			$.ajax({
				url: feed_url,
				dataType: 'jsonp',
				success: function(resp) { 
					var // Structure of resp: resp.responseData.feed.entries[]
						refs     = resp.responseData.feed.entries,
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
						entry;

					for (; i < len; i++) {
						$entry = $($entries[i]);
						// If this selector doesn't work, we need to use a filter function and check attr('zapi:type')
						entry = $.parseJSON($entry.find('subcontent').filter(filterByType('json')).text());

						// Title
						ref_html += '<h6>' + (entry.url ? '<a href="' + entry.url + '" target="_blank">' : '') + entry.title + (entry.url ? '</a>' : '') + '</h6>';

						// ref_html += refs[i].content;
						ref_html += $entry.find('subcontent').filter(filterByType('bib')).html();
					}
					callback(ref_html);
					// When this tab is selected, a resize is triggered; use that opportunity to fix the iframe height
					// And then trigger the logic once right away for the default tab
					$(window).on('resize', function() {
						// If tab height timeout is false, then the resize was triggered by this function and should be ignored
						if (tab_height_timeout === false) {
							tab_height_timeout = '';
							return;
						}
						if (tab_height_timeout !== '') {
							window.clearTimeout(tab_height_timeout);
						}
						// Set height too large, then correct it after the dust has settled
						window.frameElement.height = $body.parent().height() + 150;
						tab_height_timeout = window.setTimeout(function() {
							window.frameElement.height = $body.parent().height() + 10;
							tab_height_timeout = false;
						}, 350);
					}).trigger('resize');
				}
			});
		}
	};

	// Suggested approach
	// 1. Parse responseData.xmlString of response into a document tree and wrap it with jQuery
	// var $resp = $($.parseXML(resp.responseData.xmlString));
	// 2. Loop through the entries using .each(); if necessary, fall back to the JSON using resp.responseData.feed.entries[idx] (shouldn't be necessary)
	// $resp.find('entry').each(function(idx) {});

	// Export our Zotero API handler
	window.zotero_api = zapi;

})(window.jQuery || window.parent.jQuery);
