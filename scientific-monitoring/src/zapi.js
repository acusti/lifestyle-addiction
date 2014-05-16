(function($) {
	var zapi, js_plugin_src;

	zapi = {
		defaults : {
			collection     : '',
			user           : '1562960',
			// Number of entries to fetch
			num_entries    : 20,
			start          : 0,
			zotero_options : 'format=atom&content=json,bib&style=apa&order=date&sort=desc'
		},
		params          : {},
		callback        : {},
		collection_name : window.location.pathname.split('/').pop().replace('archive-', '').replace('monitoring-', '').replace('.html', ''),
		feed_base       : 'https://api.zotero.org/users/',
		namespace       : 'zapi\\:',
		// @todo try fetching xml nodes with namespace prefix; if it doesn't work, set namespace prefix to ''
		// Element cache (careful with using string selectors with this jQuery; it will search the parent DOM)
		$body          : $(document.body),
		$window        : $(window),
		$parent_body   : $('body'),
		$footer        : $('.c-back-to-top'),
		$year_filter   : $(),
		$year_links    : $(),
		$year_sections : $(),
		// Labels for quarter-year filters
		quarter_labels  : [
			'Jan - Mar',
			'April - June',
			'July - Sept',
			'Oct - Dec'
		],
		// An array of years of the references (for archive page)
		years      : [],
		// Total number of references
		total      : false,
		// Flag if is initial load
		is_init    : true,
		// Flag for loading all references immediately
		load_all   : false,
		// Flag for keeping track if all references have been loaded
		all_loaded : false,
		// Class to add to body when loading references
		loading_class      : 'loading-references',
		// HTML and CSS snippets
		loading_indicator_styles : '',
		loading_indicator_html   : '',
		monitoring_css           : '<%= monitoring_css %>',
		year_filter_html         : '',
		// Set the correct height of the tab iframe
		tab_height_timeout: '',
		fixTabHeight: function() {
			window.clearTimeout(zapi.tab_height_timeout);
			zapi.tab_height_timeout = window.setTimeout(function() {
				// Remove this event listener, adjust height, add back the listener
				zapi.$window.off('resize.tabs.' + zapi.collection_name);
				// Set height with extra 50px
				window.frameElement.height = zapi.tab_height = zapi.$body.parent().height() + 50;
				// Add back the listener
				window.setTimeout(function() {
					zapi.$window.on('resize.tabs.' + zapi.collection_name, zapi.fixTabHeight);
				}, 200);
			}, 200);
		},
		filterByType: function(type) {
			return function() {
				return $(this).attr('zapi:type') === type;
			};
		},
		buildParams: function(options) {
			zapi.params = $.extend({}, zapi.defaults, options);
		},
		getFeedUrl: function() {
			var feed_url = zapi.feed_base;
			
			// Build the zotero api url
			feed_url += zapi.params.user + '/collections/' + zapi.params.collection + '/items?' + zapi.params.zotero_options + '&start=' + zapi.params.start + '&limit=' + zapi.params.num_entries;
			
			// Add a 24 hour cache busting date string
			feed_url += '&cb=' + new Date().toDateString();
			
			if (zapi.params.q) {
				feed_url += '&q=' + zapi.params.q + '&qmode=titleCreatorYear';
			}
			// Build the google feed api url and return it
			return 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num=' + zapi.params.num_entries + '&q=' + encodeURIComponent(feed_url);
		},
		getReferences: function(options, callback) {
			// If we have options (like on first load), use them
			if (options) {
				// Build our params, then get the feed url
				zapi.buildParams(options);
				if (callback) {
					zapi.callback = callback;
				}
			}
			if (zapi.is_init) {
				zapi.prepareMarkup();
			}
			// If all references are already loaded, return
			if (zapi.all_loaded) {
				return;
			}
			// Get the google feed api url
			var feed_url = zapi.getFeedUrl();
			
			// Check if the iframe has our styles yet
			if (!zapi.$body.hasClass('ready')) {
				$(document).find('head').append('<style>' + zapi.monitoring_css + '\n' + zapi.loading_indicator_styles + '</style>');
				zapi.$body.addClass('ready');
			}

			// If the spinner markup is not yet in the parent.window DOM, set it up and add styles
			if (zapi.$footer.prev()[0].className !== 'spinner') {
				// First, our styles
				$('head').append('<style>' + zapi.loading_indicator_styles + '</style>');
				// And our markup
				zapi.$footer.before(zapi.loading_indicator_html);
			}
			
			// Add loading references class
			zapi.$parent_body.addClass(zapi.loading_class);
			$.ajax({
				url: feed_url,
				dataType: 'jsonp',
				success: function(resp) {
					// Do we have a good response? If not, lets try again
					if (!resp.responseData || !resp.responseData.xmlString) {
						zapi.getReferences();
						return false;
					}
					var // Structure of resp: resp.responseData.feed.entries[]
						$feed       = $($.parseXML(resp.responseData.xmlString)),
						$entries    = $feed.find('entry'),
						len         = $entries.length,
						i           = 0,
						ref_html    = '',
						the_year    = '',
						year_class  = '',
						is_new_year = false,
						the_month,
						$entry,
						$bib,
						bib_html,
						bib_url_start,
						entry,
						entry_class;

					// Check if we have set the total results yet
					if (zapi.total === false) {
						// First time through, try to fetch totalResults node using the namespace ('zapi\\:')
						zapi.total = $feed.find(zapi.namespace + 'totalResults');
						// If that failed, try it without the namespace (set the namespace as an empty string)
						if (!zapi.total.length) {
							zapi.namespace = '';
							zapi.total = $feed.find(zapi.namespace + 'totalResults');
						}
						zapi.total = parseInt(zapi.total.text(), 10);
					}
					for (; i < len; i++) {
						$entry = $($entries[i]);
						// If this selector doesn't work, we need to use a filter function and check attr('zapi:type')
						entry = $.parseJSON($entry.find(zapi.namespace + 'subcontent').filter(zapi.filterByType('json')).text());
						
						entry_class = 'ref-entry';
						
						the_year = $entry.find(zapi.namespace + 'year').text();
						is_new_year = zapi.years[zapi.years.length - 1] !== the_year;
						// Is it a new year section or the first of this group of references
						if (!ref_html.length || is_new_year) {
							// If this is not the first year header and not the first of this group of references, close the previous year div
							if (zapi.years.length && ref_html.length) {
								ref_html += '</div>';
							}
							year_class = 'year-section ' + the_year;
							// If this is the very first year, add .first class
							if (!zapi.years.length) {
								year_class += ' first';
							}
							ref_html += '<div class="' + year_class + '">';
							// If first of this year, add heading and push year onto years array
							if (is_new_year) {
								ref_html += '<h2 id="year-' + the_year + '">' + the_year + '</h2>';
								zapi.years.push(the_year);
							}
						}
						// Quarterly logic requires the date also
						if (zapi.params.quarterly) {
							the_month = new Date(entry.date);
							the_month = the_month.getMonth();
							if (isNaN(the_month)) {
								// If Date() failed to parse the_month string, default to first month
								the_month = 0;
							}
							entry_class += ' year-' + the_year + ' quarter-' + Math.floor(the_month / 3);
						}
						// Entry wrap
						ref_html += '<div class="' + entry_class + '">';
						// Title
						ref_html += '<h6>' + (entry.url ? '<a href="' + entry.url + '" target="_blank">' : '') + entry.title + (entry.url ? '</a>' : '') + '</h6>';

						$bib = $entry.find(zapi.namespace + 'subcontent').filter(zapi.filterByType('bib')).children('div');
						if ($bib.length) {
							bib_html = $bib[0].outerHTML;
							if (entry.url) {
								bib_url_start = bib_html.lastIndexOf(' from http://');
								if (bib_url_start === -1) {
									bib_url_start = bib_html.lastIndexOf(' from https://');
								}
								if (bib_url_start !== -1) {
									// The "from [url]" text always has ' Retrieved' before it, so go find that text
									// bib_url_start -= 10;
									bib_url_start = bib_html.substring(0, bib_url_start).lastIndexOf(' Retrieved');
									if (bib_url_start !== -1) {
										bib_html = bib_html.substring(0, bib_url_start) + bib_html.substring(bib_html.indexOf('</div>'));
									}
								}
							}
							ref_html += bib_html;
						}
						ref_html += '</div>';
					}
					// Close div.year-section
					ref_html += '</div>';
					// First time through, add in year filter html
					if (zapi.is_init) {
						ref_html = zapi.year_filter_html + ref_html;
					}

					// Finished building HTML
					// Pass it to callback
					// ----------------------
					zapi.callback(ref_html);
					// ----------------------

					// Initial run through, set up JS and styles for year filter
					if (zapi.is_init) {
						// Set this flag now to false to avoid conflicts with calling getReferences again
						zapi.is_init = false;
						// Attach filter by year click handler
						zapi.$year_filter = zapi.$body.find('.year-filter');
						zapi.$body.on('click.year-filter.' + zapi.collection_name, '.year-filter', zapi.loadYearFilterList);
						zapi.$body.on('references-load.' + zapi.collection_name, function() {
							var // Prepare for year calculations
								year_list = '',
								i         = 0,
								len       = zapi.years.length;

							// Reset $year_filter object from DOM
							zapi.$year_filter = zapi.$body.find('.year-filter');
							// Remove all click handlers, then add back simple toggle handler
							zapi.$body.off('click.year-filter.' + zapi.collection_name).on('click.year-filter.' + zapi.collection_name, '.year-filter', zapi.yearFilterToggle);
							zapi.$body.off('click.year-filter.' + zapi.collection_name).on('click.year-filter.' + zapi.collection_name, '.year-filter h3', zapi.yearFilterTitleToggle);
							// Set up year section element cache
							zapi.$year_sections = zapi.$body.find('.year-section');
							// Build years list
							for (; i < len; i++) {
								if (zapi.years[i].length) {
									year_list += '<h6><a class="year-link" href="#year-' + zapi.years[i] + '">' + zapi.years[i] + '</a></h6>';
								}
							}
							zapi.$year_filter.find('.group').append(year_list);
							zapi.$year_links = zapi.$year_filter.find('a.year-link');
							zapi.$year_links.on('click.' + zapi.collection_name, function(evt) {
								evt.preventDefault();
								var $year_link  = $(this),
									active_year = '';
								
								// No other year links should be active
								zapi.$year_links.not($year_link).removeClass('active');
								$year_link.toggleClass('active');
								
								if ($year_link.hasClass('active')) {
									active_year = '.' + this.innerHTML;
									/*zapi.$year_links.filter('.active').each(function() {
										active_year += (active_year.length ? ', ' : '') + '.' + this.innerHTML;
									});*/

									// Add filtered class
									zapi.$body.addClass('filtered');
									zapi.$year_sections.not(active_year).removeClass('active').fadeOut();
									zapi.$year_sections.filter(active_year).addClass('active').fadeIn();
								} else {
									zapi.$body.removeClass('filtered');
									zapi.$year_sections.fadeIn();
								}

								// Recalculate iframe height after 0.3 seconds
								window.setTimeout(function() {
									zapi.$window.trigger('resize.tabs.' + zapi.collection_name);
								}, 300);
							});
							// Remove this handler
							zapi.$body.off('references-load.' + zapi.collection_name);
							// After letting year links settle, remove loading class (to enable smooth dropdown effect)
							window.setTimeout(function() {
								zapi.$body.removeClass(zapi.loading_class);
							}, 50);
							// If .year-filter is currently active, recalculate iframe height after 0.5 seconds
							if (zapi.$year_filter.hasClass('active')) {
								window.setTimeout(function() {
									zapi.$window.trigger('resize.tabs.' + zapi.collection_name);
								}, 500);
							}
							// Now set up quarter filters, if applicable
							if (zapi.params.quarterly) {
								zapi.$body.find('h2').each(function() {
									var $year_title = $(this),
										the_year = this.innerHTML,
										quarters,
										quarter_class,
										$quarters,
										refs_by_quarter = [],
										i;
									
									if (!the_year.length) {
										return;
									}
									quarters = '<div class="quarters">';
									
									for (i = 0; i < 4; i++) {
										quarter_class = 'quarter-filter';
										refs_by_quarter[i] = zapi.$body.find('.year-section.' + the_year + ' .quarter-' + i);
										if (refs_by_quarter[i].length) {
											quarter_class += ' is-enabled';
										}
										quarters += '<span class="' + quarter_class + '" data-quarter="' + i + '">' + zapi.quarter_labels[i] + '</span>';
									}
									
									quarters += '</div>';
									
									$year_title.addClass('quarterly');
									$quarters = $(quarters).insertAfter($year_title);
									$quarters.on('click', '.quarter-filter.is-enabled', function() {
										var $filter = $(this),
											active_quarter = '',
											i;
										// No other quarter links should be active
										$quarters.find('.quarter-filter').not($filter).removeClass('active');
										$filter.toggleClass('active');
										
										if ($filter.hasClass('active')) {
											active_quarter = parseInt($filter.data('quarter'), 10);
											for (i = 0; i < 4; i++) {
												if (i !== active_quarter) {
													refs_by_quarter[i].fadeOut();
												} else {
													refs_by_quarter[i].fadeIn();
												}
											}
										} else {
											for (i = 0; i < 4; i++) {
												if (i !== active_quarter) {
													refs_by_quarter[i].fadeIn();
												}
											}
										}
									});
								});
							}
						});
					}
					zapi.is_init = false;
					zapi.$parent_body.removeClass(zapi.loading_class);
					// When this tab is selected, a resize is triggered; use that opportunity to fix the iframe height
					// And then trigger the logic once right away for the default tab
					zapi.$window.on('resize.tabs.' + zapi.collection_name, zapi.fixTabHeight).trigger('resize.tabs.' + zapi.collection_name);
					
					// If we have not yet loaded all the references, set up fetching of the next set of references
					if (zapi.params.start + zapi.params.num_entries < zapi.total) {
						zapi.getNextReferences();
					} else {
						zapi.all_loaded = true;
						zapi.$body.trigger('references-load.' + zapi.collection_name);
					}
				}
			});
		},
		// Set up infinite scroll-style fetching of next set of references (or trigger it right away if load_all)
		getNextReferences: function(timedout) {
			// If not load_all and this is not the timeout, set up timeout and return
			if (!zapi.load_all && !timedout) {
				// Make sure resize.tabs has had a chance to do its magic by attaching inview event after 500 ms
				window.setTimeout(function() {
					zapi.getNextReferences(true);
				}, 500);
				return;
			}
			zapi.params.start += zapi.params.num_entries;
			
			// If this is the first time calling getNextReferences, adjust num_entries to 50
			if (zapi.params.start === zapi.params.num_entries) {
				zapi.params.num_entries = 50;
			}
			
			// If not load_all, add a handler to the parent window to load the next set of results
			if (!zapi.load_all) {
				zapi.$footer.on('inview.' + zapi.collection_name, function() {
					// Is the current active tab this one?
					if ($('.tab-pane.active').attr('id') !== zapi.collection_name) {
						return;
					}
					// It is the current tab, so remove this handler and get the next set of references
					zapi.$footer.off('inview.' + zapi.collection_name);
					zapi.getReferences();
				});
			} else {
				zapi.getReferences();
			}
		},
		prepareMarkup: function() {
			// HTML and CSS snippets
			zapi.loading_indicator_styles = '.spinner { display: none; position: absolute; left: 45%; width: 50px; height: 30px; text-align: center; font-size: 10px; } body.' + zapi.loading_class + ' .spinner { display: block; } .spinner > div { background-color: #333; height: 100%; width: 6px; margin: 0 1px; display: inline-block;  -webkit-animation: stretchdelay 1.2s infinite ease-in-out; animation: stretchdelay 1.2s infinite ease-in-out; } .spinner .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .spinner .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .spinner .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .spinner .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% {  transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }';
			zapi.loading_indicator_html   = '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';
			zapi.year_filter_html         = '<nav class="year-filter c-accordion"><div class="item"><span class="group"><h3>Archive <div class="arrow"></div></h3>' + zapi.loading_indicator_html + '</span></div></nav>';
		},
		loadYearFilterList: function(evt) {
			evt.stopPropagation();
			// Add .active/.open
			zapi.yearFilterAddActive();
			
			if (!zapi.all_loaded) {
				if (zapi.load_all) {
					// Already working on it
					return;
				}
				// Load 'em up
				zapi.load_all = true;
				// Load max number of entries at a time
				zapi.params.num_entries = 99;
				// Set loading class
				zapi.$body.addClass(zapi.loading_class);
				// Kick off reference retrieval
				zapi.getReferences();
			}
			// Don't run this function again
			zapi.$body.off('click.year-filter.' + zapi.collection_name);
			zapi.$body.on('click.year-filter.' + zapi.collection_name, '.year-filter', zapi.yearFilterToggle);
			zapi.$body.on('click.year-filter.' + zapi.collection_name, '.year-filter h3', zapi.yearFilterTitleToggle);
		},
		yearFilterToggle: function(evt) {
			evt.stopPropagation();
			// Add .active/.open
			zapi.yearFilterAddActive();

			// Recalculate iframe height after 0.5 seconds
			window.setTimeout(function() {
				zapi.$window.trigger('resize.tabs.' + zapi.collection_name);
			}, 500);
		},
		yearFilterTitleToggle: function(evt) {
			evt.stopPropagation();
			// Toggle .active/.open
			zapi.yearFilterToggleActive();
			
			// Recalculate iframe height after 0.5 seconds
			window.setTimeout(function() {
				zapi.$window.trigger('resize.tabs.' + zapi.collection_name);
			}, 500);
		},
		yearFilterAddActive: function($year_filter) {
			$year_filter = $year_filter || zapi.$body.find('.year-filter');
			if (!$year_filter.hasClass('active')) {
				$year_filter.addClass('active');
				$year_filter.find('.item').addClass('open');
				return true;
			}
			return false;
		},
		yearFilterToggleActive: function($year_filter) {
			$year_filter = $year_filter || zapi.$body.find('.year-filter');
			if (!zapi.yearFilterAddActive($year_filter)) {
				$year_filter.removeClass('active');
				$year_filter.find('.item').removeClass('open');
			}
		}
	};

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
