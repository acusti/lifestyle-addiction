!function(a){function b(a,c){this.list=a,this.options=c=c||{};var d,e,f,g;for(d=0,g=["sort","includeScore","shouldSort"],e=g.length;e>d;d++)f=g[d],this.options[f]=f in c?c[f]:b.defaultOptions[f];for(d=0,g=["searchFn","sortFn","keys","getFn"],e=g.length;e>d;d++)f=g[d],this.options[f]=c[f]||b.defaultOptions[f]}var c=function(a,b){if(b=b||{},this.options=b,this.options.location=b.location||c.defaultOptions.location,this.options.distance="distance"in b?b.distance:c.defaultOptions.distance,this.options.threshold="threshold"in b?b.threshold:c.defaultOptions.threshold,this.options.maxPatternLength=b.maxPatternLength||c.defaultOptions.maxPatternLength,this.pattern=b.caseSensitive?a:a.toLowerCase(),this.patternLen=a.length,this.patternLen>this.options.maxPatternLength)throw new Error("Pattern length is too long");this.matchmask=1<<this.patternLen-1,this.patternAlphabet=this._calculatePatternAlphabet()};c.defaultOptions={location:0,distance:100,threshold:.6,maxPatternLength:32},c.prototype._calculatePatternAlphabet=function(){var a={},b=0;for(b=0;b<this.patternLen;b++)a[this.pattern.charAt(b)]=0;for(b=0;b<this.patternLen;b++)a[this.pattern.charAt(b)]|=1<<this.pattern.length-b-1;return a},c.prototype._bitapScore=function(a,b){var c=a/this.patternLen,d=Math.abs(this.options.location-b);return this.options.distance?c+d/this.options.distance:d?1:c},c.prototype.search=function(a){if(a=this.options.caseSensitive?a:a.toLowerCase(),this.pattern===a)return{isMatch:!0,score:0};var b,c,d,e,f,g,h,i,j,k=a.length,l=this.options.location,m=this.options.threshold,n=a.indexOf(this.pattern,l),o=this.patternLen+k,p=1,q=[];for(-1!=n&&(m=Math.min(this._bitapScore(0,n),m),n=a.lastIndexOf(this.pattern,l+this.patternLen),-1!=n&&(m=Math.min(this._bitapScore(0,n),m))),n=-1,b=0;b<this.patternLen;b++){for(d=0,e=o;e>d;)this._bitapScore(b,l+e)<=m?d=e:o=e,e=Math.floor((o-d)/2+d);for(o=e,f=Math.max(1,l-e+1),g=Math.min(l+e,k)+this.patternLen,h=Array(g+2),h[g+1]=(1<<b)-1,c=g;c>=f;c--)if(j=this.patternAlphabet[a.charAt(c-1)],h[c]=0===b?(h[c+1]<<1|1)&j:(h[c+1]<<1|1)&j|((i[c+1]|i[c])<<1|1)|i[c+1],h[c]&this.matchmask&&(p=this._bitapScore(b,c-1),m>=p)){if(m=p,n=c-1,q.push(n),!(n>l))break;f=Math.max(1,2*l-n)}if(this._bitapScore(b+1,l)>m)break;i=h}return{isMatch:n>=0,score:p}};var d=function(a,b,c){var f,g,h;if(b){h=b.indexOf("."),-1!==h?(f=b.slice(0,h),g=b.slice(h+1)):f=b;var i=a[f];if(i)if(g||"string"!=typeof i)if(e.isArray(i))for(var j=0,k=i.length;k>j;j++)d(i[j],g,c);else g&&d(i,g,c);else c.push(i)}else c.push(a);return c},e={deepValue:function(a,b){return d(a,b,[])},isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)}};b.defaultOptions={id:null,caseSensitive:!1,includeScore:!1,shouldSort:!0,searchFn:c,sortFn:function(a,b){return a.score-b.score},getFn:e.deepValue,keys:[]},b.prototype.search=function(a){var b,c,d,f,g=new this.options.searchFn(a,this.options),h=this.list,i=h.length,j=this.options,k=this.options.keys,l=k.length,m=[],n={},o=[],p=function(a,b,c){if(void 0!==a&&null!==a)if("string"==typeof a)d=g.search(a),d.isMatch&&(f=n[c],f?f.score=Math.min(f.score,d.score):(n[c]={item:b,score:d.score},m.push(n[c])));else if(e.isArray(a))for(var h=0;h<a.length;h++)p(a[h],b,c)};if("string"==typeof h[0])for(var q=0;i>q;q++)p(h[q],q,q);else for(var q=0;i>q;q++)for(c=h[q],b=0;l>b;b++)p(j.getFn(c,k[b]),c,q);j.shouldSort&&m.sort(j.sortFn);for(var r=j.includeScore?function(a){return m[a]}:function(a){return m[a].item},s=j.id?function(a){m[a].item=j.getFn(m[a].item,j.id)}:function(){},q=0,t=m.length;t>q;q++)s(q),o.push(r(q));return o},"object"==typeof exports?module.exports=b:"function"==typeof define&&define.amd?define(function(){return b}):a.Fuse=b}(this),function(a){var b,c;b={defaults:{collection:"",user:"1562960",num_entries:99,start:0,zotero_options:"format=atom&content=json,bib&style=apa&order=date&sort=desc",ip:!1},params:{},callback:{},collection_name:window.location.pathname.split("/").pop().replace("archive-","").replace("monitoring-","").replace(".html",""),feed_base:"https://api.zotero.org/users/",namespace:"zapi\\:",lang:"en",$body:a(document.body),$window:a(window),$parent_body:a("body"),$footer:a(".c-back-to-top"),$year_filter:a(),$year_links:a(),$year_sections:a(),quarter_labels:{en:["Jan - Mar","April - June","July - Sept","Oct - Dec"],fr:["Jan - Mars","Avril - Juin","Juil - Sept","Oct - Dec"]},years:[],is_init:!0,is_all_loading:!1,is_all_loaded:!1,loading_class:"loading-references",loading_indicator_styles:"",loading_indicator_html:"",monitoring_css:'.year-filter{width:24%;min-width:145px;float:right;margin:0 0 .5em .25em;border:1px solid #e5e5e5}.year-filter .item{position:relative;max-height:40px;padding:.5em .75em;overflow:hidden;cursor:pointer;-webkit-transition:max-height .35s;transition:max-height .35s}.year-filter.active .item{max-height:450px;overflow-y:auto;cursor:default}body.loading-references .year-filter.active .item{max-height:110px;overflow:hidden}.year-filter .spinner{position:static;margin:1em auto}.c-accordion .arrow{position:absolute;top:0;right:1px;width:20px;height:20px;background:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="216px" height="146px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve"><path d="M168.452,42.121l-6.109-6.111c-2.118-2.009-4.59-3.014-7.413-3.014c-2.88,0-5.324,1.005-7.334,3.014L108,75.607 L68.404,36.011c-2.01-2.009-4.454-3.014-7.333-3.014c-2.824,0-5.296,1.005-7.414,3.014l-6.029,6.111 c-2.064,2.063-3.096,4.535-3.096,7.414c0,2.933,1.033,5.377,3.096,7.332l53.039,53.039c1.956,2.064,4.399,3.096,7.333,3.096 c2.879,0,5.35-1.032,7.413-3.096l53.039-53.039c2.01-2.01,3.016-4.454,3.016-7.332C171.468,46.711,170.462,44.24,168.452,42.121z"/></svg>\') no-repeat center center;background-size:26px;-webkit-transition:all .3s;transition:all .3s}.c-accordion .open .arrow{-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.year-filter h3{position:relative;cursor:pointer}.year-filter h6 a{display:block;padding:.2em 1em}.quarter-filter.is-enabled:hover,.year-filter h6 a:hover{background:#f0f0f0;cursor:pointer}.quarter-filter.active,.quarter-filter.active:hover,.year-filter h6 a.active,.year-filter h6 a.active:hover{background:#ddd}.quarters{float:left;margin-left:9px;margin-top:20px;line-height:42px}#boot .year-section h2{margin-top:20px}#boot .year-section.first h2,#boot.filtered .year-section h2{margin-top:0}#boot .year-section h6{margin-top:1em}.filtered .year-section .quarters,.year-section.first .quarters{margin-top:0}.quarter-filter{border:1px solid #e5e5e5;font-weight:700;font-size:13px;padding:.25em .35em;margin:0 .25em;opacity:.5}.quarter-filter.is-enabled{opacity:1}h2.quarterly{float:left}.ref-entry{clear:left}#boot .year-filter h6 a:hover{text-decoration:none}#boot .year-filter.active .item:hover{background-color:transparent}',year_filter_html:"",tab_height_timeout:"",fixTabHeight:function(){window.clearTimeout(b.tab_height_timeout),b.tab_height_timeout=window.setTimeout(function(){b.$window.off("resize.tabs."+b.collection_name),window.frameElement.height=b.tab_height=b.$body.parent().height()+50,window.setTimeout(function(){b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight)},200)},200)},filterByType:function(b){return function(){return a(this).attr("zapi:type")===b}},buildParams:function(c){b.params=a.extend({},b.defaults,c)},getFeedUrl:function(){var a=b.feed_base;return a+=b.params.user+"/collections/"+b.params.collection+"/items?"+b.params.zotero_options+"&start="+b.params.start+"&limit="+b.params.num_entries,a+="&cb="+(new Date).toDateString(),b.params.q&&(a+="&q="+b.params.q+"&qmode=titleCreatorYear"),"https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num="+b.params.num_entries+(b.params.ip?"&userip="+b.params.ip:"")+"&q="+encodeURIComponent(a)},getReferences:function(c,d){if(c&&(b.buildParams(c),d&&(b.callback=d),"fr"===parent.window.location.pathname.substr(1).split("/").shift()&&(b.lang="fr")),b.is_init&&b.initialize(),!b.is_all_loaded){var e=b.getFeedUrl();b.$body.hasClass("ready")||(a(document).find("head").append("<style>"+b.monitoring_css+"\n"+b.loading_indicator_styles+"</style>"),b.$body.addClass("ready")),b.$footer.prev().length&&"spinner"===b.$footer.prev()[0].className||(a("head").append("<style>"+b.loading_indicator_styles+"</style>"),b.$footer.before(b.loading_indicator_html)),b.$parent_body.addClass(b.loading_class),a.ajax({url:e,dataType:"jsonp"}).done(function(c){var d,e,f,g,h,i,j,k,l=a(a.parseXML(c.responseData.xmlString)),m=l.find("entry"),n=m.length,o=0,p="",q="",r="",s="",t="",u=!1,v=[];for(b.is_init&&n&&(a(m[0]).find(b.namespace+"subcontent").length||(b.namespace=""));n>o;o++){if(f=a(m[o]),j=a.parseJSON(f.find(b.namespace+"subcontent").filter(b.filterByType("json")).text()),k="ref-entry",q=f.find(b.namespace+"parsedDate").text().split("-"),r=q[0]||"",u=b.years[b.years.length-1]!==r,(!p.length||u)&&r&&(b.years.length&&p.length&&(p+="</div>"),s="year-section "+r,b.years.length||(s+=" first"),p+='<div class="'+s+'">',u)){if(b.params.quarterly&&(t=' class="quarterly"'),p+='<h2 id="year-'+r+'"'+t+">"+r+"</h2>",b.years.push(r),b.params.quarterly){for(p+='<div class="quarters">',d=0;4>d;d++)p+='<span class="quarter-filter" data-quarter="'+d+'">'+b.quarter_labels[b.lang][d]+"</span>";p+="</div>"}b.years.length>1&&v.push(b.years[b.years.length-2])}b.params.quarterly&&(e=q[1]||0,k+=" year-"+r+" quarter-"+Math.floor(e/3)),p+='<div class="'+k+'">',p+="<h6>"+(j.url?'<a href="'+j.url+'" target="_blank">':"")+j.title+(j.url?"</a>":"")+"</h6>",g=f.find(b.namespace+"subcontent").filter(b.filterByType("bib")).children("div"),g.length&&(h=g[0].outerHTML,j.url&&(i=h.lastIndexOf(" from http://"),-1===i&&(i=h.lastIndexOf(" from https://")),-1!==i&&(i=h.substring(0,i).lastIndexOf(" Retrieved"),-1!==i&&(h=h.substring(0,i)+h.substring(h.indexOf("</div>"))))),p+=h),p+="</div>"}p+="</div>",b.is_init&&(p=b.year_filter_html+p),b.callback(p),b.is_init&&(b.is_init=!1,b.$year_filter=b.$body.find(".year-filter"),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.loadYearFilterList),b.$body.on("references-load."+b.collection_name,function(){var c="",d=0,e=b.years.length;for(b.$year_filter=b.$body.find(".year-filter"),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle),b.$year_sections=b.$body.find(".year-section");e>d;d++)4===b.years[d].length&&(c+='<h6><a class="year-link" href="#year-'+b.years[d]+'">'+b.years[d]+"</a></h6>");b.$year_filter.find(".group").append(c),b.$year_links=b.$year_filter.find("a.year-link"),b.$year_links.on("click."+b.collection_name,function(c){c.preventDefault();var d=a(this),e="";b.$year_links.not(d).removeClass("active"),d.toggleClass("active"),d.hasClass("active")?(e="."+this.innerHTML,b.$body.addClass("filtered"),b.$year_sections.not(e).removeClass("active").fadeOut(),b.$year_sections.filter(e).addClass("active").fadeIn()):(b.$body.removeClass("filtered"),b.$year_sections.fadeIn()),window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},300)}),b.$body.off("references-load."+b.collection_name),window.setTimeout(function(){b.$body.removeClass(b.loading_class)},200),b.$year_filter.hasClass("active")&&b.$window.trigger("change-height.tabs."+b.collection_name),window.setTimeout(function(){b.setupQuarterFilters(b.years)},200)})),b.is_init=!1,b.$parent_body.removeClass(b.loading_class),b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight).trigger("resize.tabs."+b.collection_name),n>=b.params.num_entries&&b.params.start<3e3?b.params.quarterly&&!b.is_all_loading?(b.getNextReferences(!0),b.getAllReferences()):b.getNextReferences():(v.push(r),b.is_all_loaded=!0,b.$body.trigger("references-load."+b.collection_name)),v.length&&b.setupQuarterFilters(v)}).fail(function(){b.getReferences()})}},getNextReferences:function(c){return b.is_all_loading||c?(b.params.start+=b.params.num_entries,void(b.is_all_loading?b.getReferences():b.$footer.on("inview."+b.collection_name,function(){a(".tab-pane.active").attr("id")===b.collection_name&&(b.$footer.off("inview."+b.collection_name),b.getReferences())}))):void window.setTimeout(function(){b.getNextReferences(!0)},500)},getAllReferences:function(){b.is_all_loaded||b.is_all_loading||(b.is_all_loading=!0,b.$body.addClass(b.loading_class),b.getReferences())},initialize:function(){b.prepareMarkup(),a.ajax({url:"http://www.telize.com/jsonip",dataType:"jsonp",success:function(a){b.params.ip=a.ip}}),b.$window.on("change-height.tabs."+b.collection_name,function(){window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},500)})},prepareMarkup:function(){b.loading_indicator_styles=".spinner { display: none; position: absolute; left: 45%; width: 50px; height: 30px; text-align: center; font-size: 10px; } body."+b.loading_class+" .spinner { display: block; } .spinner > div { background-color: #333; height: 100%; width: 6px; margin: 0 1px; display: inline-block;  -webkit-animation: stretchdelay 1.2s infinite ease-in-out; animation: stretchdelay 1.2s infinite ease-in-out; } .spinner .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .spinner .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .spinner .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .spinner .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% {  transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }",b.loading_indicator_html='<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>',b.year_filter_html='<nav class="year-filter c-accordion"><div class="item"><span class="group"><h3>Archive <div class="arrow"></div></h3>'+b.loading_indicator_html+"</span></div></nav>"},loadYearFilterList:function(a){a.stopPropagation(),b.yearFilterAddActive(),(b.is_all_loaded||!b.is_all_loading)&&(b.$body.off("click.year-filter."+b.collection_name),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle))},yearFilterToggle:function(a){a.stopPropagation(),b.yearFilterAddActive(),b.$window.trigger("change-height.tabs."+b.collection_name)},yearFilterTitleToggle:function(a){a.stopPropagation(),b.yearFilterToggleActive(),b.$window.trigger("change-height.tabs."+b.collection_name)},yearFilterAddActive:function(a){return a=a||b.$body.find(".year-filter"),a.hasClass("active")?!1:(a.addClass("active"),a.find(".item").addClass("open"),!0)},yearFilterToggleActive:function(a){a=a||b.$body.find(".year-filter"),b.yearFilterAddActive(a)||(a.removeClass("active"),a.find(".item").removeClass("open"))},setupQuarterFilters:function(a){var c,d,e,f=0,g=a.length;if(b.params.quarterly&&g)for(;g>f;f++)if(4===a[f].length&&(c=b.$body.find(".year-section."+a[f]+" .quarters"),d=[],e=0,c.length)){for(;4>e;e++)d[e]=b.$body.find(".year-section."+a[f]+" .quarter-"+e),d[e].length&&c.find('[data-quarter="'+e+'"]').addClass("is-enabled");b.attachQuarterFilterToggle(c,d)}},attachQuarterFilterToggle:function(c,d){c.find(".quarter-filter.is-enabled").off("click.quarter-filter."+b.collection_name).on("click.quarter-filter."+b.collection_name,function(){var e,f=a(this),g="";if(c.find(".quarter-filter").not(f).removeClass("active"),f.toggleClass("active"),f.hasClass("active"))for(g=parseInt(f.data("quarter"),10),e=0;4>e;e++)e!==g?d[e].fadeOut():d[e].fadeIn();else for(e=0;4>e;e++)e!==g&&d[e].fadeIn();b.$window.trigger("change-height.tabs."+b.collection_name)})}},window.zotero_api=window.zotero_api||{},window.zotero_api=a.extend(b,window.zotero_api),void 0===a.event.special.inview&&(c=window.location.href.split("/"),c.pop(),c.push("jquery.inview.min.js"),b.$parent_body.append('<script src="'+c.join("/")+'"></script>'))}(window.jQuery||window.parent.jQuery);
//# sourceMappingURL=zapi.map