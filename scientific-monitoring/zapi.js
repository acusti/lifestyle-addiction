(function($) {
	var zapi, js_plugin_src;

	zapi = {
		defaults        : {
			collection     : '',
			user           : '1562960',
			// Number of entries to fetch
			num_entries    : 20,
			start          : 0,
			zotero_options : 'format=atom&content=json,bib&style=apa&order=date&sort=desc',
			ip             : false
		},
		params          : {},
		callback        : {},
		collection_name : window.location.pathname.split('/').pop().replace('archive-', '').replace('monitoring-', '').replace('.html', ''),
		feed_base       : 'https://api.zotero.org/users/',
		namespace       : 'zapi\\:',
		lang            : 'en',
		// Element cache (careful with using string selectors with this jQuery; it will search the parent DOM)
		$body           : $(document.body),
		$window         : $(window),
		$parent_body    : $('body'),
		$footer         : $('.c-back-to-top'),
		$year_filter    : $(),
		$year_links     : $(),
		$year_sections  : $(),
		// Labels for quarter-year filters
		quarter_labels  : {
			'en': [
				'Jan - Mar',
				'April - June',
				'July - Sept',
				'Oct - Dec'
			],
			'fr': [
				'Jan - Mars',
				'Avril - Juin',
				'Juil - Sept',
				'Oct - Dec'
			]
		},
		// An array of years of the references (for archive page)
		years                    : [],
		// Total number of references
		total                    : false,
		// Flag if is initial load
		is_init                  : true,
		// Flag for loading all references immediately
		is_all_loading           : false,
		// Flag for keeping track if all references have been loaded
		is_all_loaded            : false,
		// Class to add to body when loading references
		loading_class            : 'loading-references',
		// HTML and CSS snippets
		loading_indicator_styles : '',
		loading_indicator_html   : '',
		monitoring_css           : '.year-filter{width:24%;min-width:145px;float:right;margin:0 0 .5em .25em}.year-filter .item{position:relative;max-height:50px;overflow:hidden;cursor:pointer}.year-filter.active .item{max-height:450px;overflow-y:auto;cursor:default}body.loading-references .year-filter.active .item{max-height:110px;overflow:hidden}.year-filter .spinner{position:static;margin:1em auto}.year-filter h3{position:relative;cursor:pointer}.year-filter h6 a{display:block;padding:.2em 1em}.quarter-filter.is-enabled:hover,.year-filter h6 a:hover{background:#f0f0f0;cursor:pointer}.quarter-filter.active,.quarter-filter.active:hover,.year-filter h6 a.active,.year-filter h6 a.active:hover{background:#ddd}.quarters{float:left;margin-left:9px;margin-top:20px;line-height:42px}#boot .year-section h2{margin-top:20px}#boot .year-section.first h2,#boot.filtered .year-section h2{margin-top:0}#boot .year-section h6{margin-top:1em}.filtered .year-section .quarters,.year-section.first .quarters{margin-top:0}.quarter-filter{border:1px solid #e5e5e5;font-weight:700;font-size:13px;padding:.25em .35em;margin:0 .25em;-ms-filter:"alpha(Opacity=50)";filter:alpha(opacity=50);opacity:.5}.quarter-filter.is-enabled{-ms-filter:"alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1}h2.quarterly{float:left}.ref-entry{clear:left}#boot .year-filter h6 a:hover{text-decoration:none}#boot .year-filter.active .item:hover{background-color:transparent}',
		year_filter_html         : '',
		// Set the correct height of the tab iframe
		tab_height_timeout       : '',
		fixTabHeight : function() {
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
		filterByType : function(type) {
			return function() {
				return $(this).attr('zapi:type') === type;
			};
		},
		buildParams  : function(options) {
			zapi.params = $.extend({}, zapi.defaults, options);
			if (zapi.params.quarterly) {
				zapi.params.num_entries = 99;
			}
		},
		getFeedUrl   : function() {
			var feed_url = zapi.feed_base;
			
			// Build the zotero api url
			feed_url += zapi.params.user + '/collections/' + zapi.params.collection + '/items?' + zapi.params.zotero_options + '&start=' + zapi.params.start + '&limit=' + zapi.params.num_entries;
			
			// Add a 24 hour cache busting date string
			feed_url += '&cb=' + new Date().toDateString();
			
			if (zapi.params.q) {
				feed_url += '&q=' + zapi.params.q + '&qmode=titleCreatorYear';
			}
			// Build the google feed api url and return it
			return 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num=' + zapi.params.num_entries + (zapi.params.ip ? '&userip=' + zapi.params.ip : '') + '&q=' + encodeURIComponent(feed_url);
		},
		getReferences: function(options, callback) {
			// If we have options (like on first load), use them
			if (options) {
				// Build our params, then get the feed url
				zapi.buildParams(options);
				if (callback) {
					zapi.callback = callback;
				}
				// Special logic for language
				if (parent.window.location.pathname.substr(1).split('/').shift() === 'fr') {
					zapi.lang = 'fr';
				}
			}
			if (zapi.is_init) {
				zapi.initialize();
			}
			// If all references are already loaded, return
			if (zapi.is_all_loaded) {
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
				url      : feed_url,
				dataType : 'jsonp',
				success  : function(resp) {
					// Do we have a good response? If not, lets try again
					if (!resp.responseData || !resp.responseData.xmlString) {
						zapi.getReferences();
						return false;
					}
					var // Structure of resp: resp.responseData.feed.entries[]
						$feed              = $($.parseXML(resp.responseData.xmlString)),
						$entries           = $feed.find('entry'),
						len                = $entries.length,
						i                  = 0,
						ref_html           = '',
						the_year           = '',
						year_class         = '',
						year_title_class   = '',
						is_new_year        = false,
						years_for_quarters = [],
						qtr_idx,
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
						// If we found it, set it. Otherwise, keep zapi.total as false
						if (zapi.total.length) {
							zapi.total = parseInt(zapi.total.text(), 10);
						} else {
							zapi.total = false;
						}
					}
					for (; i < len; i++) {
						$entry = $($entries[i]);
						// If this selector doesn't work, we need to use a filter function and check attr('zapi:type')
						entry = $.parseJSON($entry.find(zapi.namespace + 'subcontent').filter(zapi.filterByType('json')).text());
						
						entry_class = 'ref-entry';
						
						the_year = $entry.find(zapi.namespace + 'year').text();
						is_new_year = zapi.years[zapi.years.length - 1] !== the_year;
						// Is it a new year section or the first of this group of references
						if ((!ref_html.length || is_new_year) && the_year) {
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
								if (zapi.params.quarterly) {
									year_title_class = ' class="quarterly"';
								}
								ref_html += '<h2 id="year-' + the_year + '"' + year_title_class + '>' + the_year + '</h2>';
								zapi.years.push(the_year);
								// If is quarterly, add quarters
								if (zapi.params.quarterly) {
									ref_html += '<div class="quarters">';
									for (qtr_idx = 0; qtr_idx < 4; qtr_idx++) {

										ref_html += '<span class="quarter-filter" data-quarter="' + qtr_idx + '">' + zapi.quarter_labels[zapi.lang][qtr_idx] + '</span>';
									}
									ref_html += '</div>';
								}
								// If there is a previous year, process it for quarterly
								if (zapi.years.length > 1) {
									years_for_quarters.push(zapi.years[zapi.years.length - 2]);
								}
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
								if (zapi.years[i].length === 4) {
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
							}, 200);
							// If .year-filter is currently active, height has changed, so trigger our event
							if (zapi.$year_filter.hasClass('active')) {
								zapi.$window.trigger('change-height.tabs.' + zapi.collection_name);
							}
							// Reload all quarter filters (to avoid bug with first couple year's quarter filter click handlers no longer being triggered after all references finish loading)
							window.setTimeout(function() {
								zapi.setupQuarterFilters(zapi.years);
							}, 200);
						});
					}
					zapi.is_init = false;
					zapi.$parent_body.removeClass(zapi.loading_class);
					// When this tab is selected, a resize is triggered; use that opportunity to fix the iframe height
					// And then trigger the logic once right away for the default tab
					zapi.$window.on('resize.tabs.' + zapi.collection_name, zapi.fixTabHeight).trigger('resize.tabs.' + zapi.collection_name);
					
					// If we have not yet loaded all the references, set up fetching of the next set of references
					// First check to make sure we have a valid total (if not, try to fetch the next set)
					if (zapi.total === false || zapi.params.start + zapi.params.num_entries < zapi.total) {
						// Special logic for quarterly collections (in which case load all references)
						if (zapi.params.quarterly && !zapi.is_all_loading) {
							// Trigger immediate set up of next references (don't need infinite loading functionality)
							zapi.getNextReferences(true);
							zapi.getAllReferences();
						} else {
							// Set up next references set
							zapi.getNextReferences();
						}
					} else {
						// We have finished, so we can process the last year's quarter filters
						years_for_quarters.push(the_year);
						zapi.is_all_loaded = true;
						zapi.$body.trigger('references-load.' + zapi.collection_name);
					}
					// Quarter filter setup
					if (years_for_quarters.length) {
						zapi.setupQuarterFilters(years_for_quarters);
					}
				}
			});
		},
		// Set up infinite scroll-style fetching of next set of references (or trigger it right away if is_all_loading)
		getNextReferences: function(timedout) {
			// If not is_all_loading and this is not the timeout, set up timeout and return
			if (!zapi.is_all_loading && !timedout) {
				// Make sure resize.tabs has had a chance to do its magic by attaching inview event after 500 ms
				window.setTimeout(function() {
					zapi.getNextReferences(true);
				}, 500);
				return;
			}
			zapi.params.start += zapi.params.num_entries;
			
			// If this is the first time calling getNextReferences, adjust num_entries to max
			if (zapi.params.start === zapi.params.num_entries) {
				zapi.params.num_entries = 99;
			}
			
			// If not is_all_loading, add a handler to the parent window to load the next set of results
			if (!zapi.is_all_loading) {
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
		// Get all the rest of the references
		getAllReferences: function() {
			// If already loaded or loading all references, return
			if (zapi.is_all_loaded || zapi.is_all_loading) {
				return;
			}
			// Load 'em up
			zapi.is_all_loading = true;
			// Load max number of entries at a time
			zapi.params.num_entries = 99;
			// Set loading class
			zapi.$body.addClass(zapi.loading_class);
			// Kick off reference retrieval
			zapi.getReferences();
		},
		initialize: function() {
			zapi.prepareMarkup();
			// Get current ip address for google API calls
			$.ajax({
				url      : 'http://www.telize.com/jsonip',
				dataType : 'jsonp',
				success  : function(resp) {
					zapi.params.ip = resp.ip;
				}
			});
			// Add custom height change event handler to body
			zapi.$window.on('change-height.tabs.' + zapi.collection_name, function() {
				// Trigger resize tabs event after 0.5 seconds
				window.setTimeout(function() {
					zapi.$window.trigger('resize.tabs.' + zapi.collection_name);
				}, 500);
			});
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
			
			if (!zapi.is_all_loaded) {
				if (zapi.is_all_loading) {
					// Already working on it
					return;
				}
			}
			// Don't run this function again
			zapi.$body.off('click.year-filter.' + zapi.collection_name);
			zapi.$body.on( 'click.year-filter.' + zapi.collection_name, '.year-filter', zapi.yearFilterToggle);
			zapi.$body.on( 'click.year-filter.' + zapi.collection_name, '.year-filter h3', zapi.yearFilterTitleToggle);
		},
		yearFilterToggle: function(evt) {
			evt.stopPropagation();
			// Add .active/.open
			zapi.yearFilterAddActive();
			// Trigger change height
			zapi.$window.trigger('change-height.tabs.' + zapi.collection_name);
		},
		yearFilterTitleToggle: function(evt) {
			evt.stopPropagation();
			// Toggle .active/.open
			zapi.yearFilterToggleActive();
			// Trigger change height
			zapi.$window.trigger('change-height.tabs.' + zapi.collection_name);
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
		},
		setupQuarterFilters: function(the_years) {
			var i   = 0,
				len = the_years.length,
				$quarters,
				refs_by_quarter,
				qtr_idx;

			if (!zapi.params.quarterly || !len) {
				return;
			}
			// Set up quarter filters, if applicable
			for (; i < len; i++) {
				if (the_years[i].length !== 4) {
					continue;
				}
				$quarters       = zapi.$body.find('.year-section.' + the_years[i] + ' .quarters');
				refs_by_quarter = [];
				qtr_idx         = 0;

				if (!$quarters.length) {
					continue;
				}
				for (; qtr_idx < 4; qtr_idx++) {
					refs_by_quarter[qtr_idx] = zapi.$body.find('.year-section.' + the_years[i] + ' .quarter-' + qtr_idx);
					if (refs_by_quarter[qtr_idx].length) {
						$quarters.find('[data-quarter="' + qtr_idx +'"]').addClass('is-enabled');
					}
				}
				zapi.attachQuarterFilterToggle($quarters, refs_by_quarter);
			}
		},
		attachQuarterFilterToggle: function($quarters, refs_by_quarter) {
			$quarters.find('.quarter-filter.is-enabled').off('click.quarter-filter.' + zapi.collection_name).on('click.quarter-filter.' + zapi.collection_name, function() {
				var $filter        = $(this),
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
				// Trigger change height
				zapi.$window.trigger('change-height.tabs.' + zapi.collection_name);
			});
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
