!function(a){var b,c;b={defaults:{collection:"",user:"1562960",num_entries:20,start:0,zotero_options:"format=atom&content=json,bib&style=apa&order=date&sort=desc"},params:{},callback:{},collection_name:window.location.pathname.split("/").pop().replace("archive-","").replace("monitoring-","").replace(".html",""),feed_base:"https://api.zotero.org/users/",namespace:"zapi\\:",$body:a(document.body),$window:a(window),$parent_body:a("body"),$footer:a(".c-back-to-top"),$year_filter:a(),$year_links:a(),$year_sections:a(),years:[],total:!1,is_init:!0,load_all:!1,all_loaded:!1,loading_class:"loading-references",year_section_class:"year-section",loading_indicator_styles:"",loading_indicator_html:"",year_heading_styles:"",year_filter_html:"",year_filter_styles:"",tab_height_timeout:"",fixTabHeight:function(){window.clearTimeout(b.tab_height_timeout),b.tab_height_timeout=window.setTimeout(function(){b.$window.off("resize.tabs."+b.collection_name),window.frameElement.height=b.tab_height=b.$body.parent().height()+50,window.setTimeout(function(){b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight)},200)},200)},filterByType:function(b){return function(){return a(this).attr("zapi:type")===b}},buildParams:function(c){b.params=a.extend({},b.defaults,c)},getFeedUrl:function(){var a=b.feed_base;return a+=b.params.user+"/collections/"+b.params.collection+"/items?"+b.params.zotero_options+"&start="+b.params.start+"&limit="+b.params.num_entries,b.params.q&&(a+="&q="+b.params.q+"&qmode=titleCreatorYear"),"https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num="+b.params.num_entries+"&q="+encodeURIComponent(a)},getReferences:function(c,d){if(c&&(b.buildParams(c),d&&(b.callback=d)),b.is_init&&b.prepareMarkup(),!b.all_loaded){var e=b.getFeedUrl();b.$body.hasClass("ready")||(a(document).find("head").append("<style>"+b.year_heading_styles+"\n"+b.loading_indicator_styles+"\n"+b.year_filter_styles+"</style>"),b.$body.addClass("ready")),"spinner"!==b.$footer.prev()[0].className&&(a("head").append("<style>"+b.loading_indicator_styles+"</style>"),b.$footer.before(b.loading_indicator_html)),b.$parent_body.addClass(b.loading_class),a.ajax({url:e,dataType:"jsonp",success:function(c){var d,e,f,g,h,i=a(a.parseXML(c.responseData.xmlString)),j=i.find("entry"),k=j.length,l=0,m="",n="",o="",p=!1;for(b.total===!1&&(b.total=i.find(b.namespace+"totalResults"),b.total.length||(b.namespace="",b.total=i.find(b.namespace+"totalResults")),b.total=parseInt(b.total.text(),10));k>l;l++)d=a(j[l]),h=a.parseJSON(d.find(b.namespace+"subcontent").filter(b.filterByType("json")).text()),n=d.find(b.namespace+"year").text(),p=b.years[b.years.length-1]!==n,(!m.length||p)&&(b.years.length&&m.length&&(m+="</div>"),o=b.year_section_class+" "+n,b.years.length||(o+=" first"),m+='<div class="'+o+'">',p&&(m+='<h2 id="year-'+n+'">'+n+"</h2>",b.years.push(n))),m+="<h6>"+(h.url?'<a href="'+h.url+'" target="_blank">':"")+h.title+(h.url?"</a>":"")+"</h6>",e=d.find(b.namespace+"subcontent").filter(b.filterByType("bib")).children("div"),e.length&&(f=e[0].outerHTML,h.url&&(g=f.lastIndexOf(" from http://"),-1===g&&(g=f.lastIndexOf(" from https://")),g>0&&(g=f.lastIndexOf(". Retrieved "),f=f.substring(0,g+1)+f.substring(f.indexOf("</div>")))),m+=f);m+="</div>",b.is_init&&(m=b.year_filter_html+m),b.callback(m),b.is_init&&(b.is_init=!1,b.$year_filter=b.$body.find(".year-filter"),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.loadYearFilterList),b.$body.on("references-load."+b.collection_name,function(){var c="",d=0,e=b.years.length;for(b.$year_filter=b.$body.find(".year-filter"),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle),b.$year_sections=b.$body.find("."+b.year_section_class);e>d;d++)c+='<h6><a class="year-link" href="#year-'+b.years[d]+'">'+b.years[d]+"</a></h6>";b.$year_filter.append(c),b.$year_links=b.$year_filter.find("a.year-link"),b.$year_links.on("click."+b.collection_name,function(c){c.preventDefault();var d=a(this),e="";d.toggleClass("active"),b.$year_links.filter(".active").each(function(){e+=(e.length?", ":"")+"."+this.innerHTML}),b.$body.addClass("filtered"),b.$year_sections.not(e).removeClass("active").fadeOut(),b.$year_sections.filter(e).addClass("active").fadeIn(),window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},300)}),b.$body.off("references-load."+b.collection_name),window.setTimeout(function(){b.$body.removeClass(b.loading_class)},50),b.$year_filter.hasClass("active")&&window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},500)})),b.is_init=!1,b.$parent_body.removeClass(b.loading_class),b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight).trigger("resize.tabs."+b.collection_name),b.params.start+b.params.num_entries<b.total?b.getNextReferences():(b.all_loaded=!0,b.$body.trigger("references-load."+b.collection_name))}})}},getNextReferences:function(c){return b.load_all||c?(b.params.start+=b.params.num_entries,b.params.start===b.params.num_entries&&(b.params.num_entries=50),void(b.load_all?b.getReferences():b.$footer.on("inview."+b.collection_name,function(){a(".tab-pane.active").attr("id")===b.collection_name&&(b.$footer.off("inview."+b.collection_name),b.getReferences())}))):void window.setTimeout(function(){b.getNextReferences(!0)},500)},prepareMarkup:function(){b.loading_indicator_styles=".spinner { display: none; position: absolute; left: 45%; width: 50px; height: 30px; text-align: center; font-size: 10px; } body."+b.loading_class+" .spinner { display: block; } .spinner > div { background-color: #333; height: 100%; width: 6px; margin: 0 1px; display: inline-block;  -webkit-animation: stretchdelay 1.2s infinite ease-in-out; animation: stretchdelay 1.2s infinite ease-in-out; } .spinner .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .spinner .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .spinner .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .spinner .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% {  transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }",b.loading_indicator_html='<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>',b.year_heading_styles="#boot ."+b.year_section_class+" > h2 { margin-top: 20px; } #boot ."+b.year_section_class+".first > h2 { margin-top: 0; }",b.year_filter_html='<nav class="year-filter c-accordion"><span class="group"><h3>Archive <div class="arrow"></div></h3>'+b.loading_indicator_html+"</span></nav>",b.year_filter_styles="nav.year-filter{width:30%;min-width:160px;float:right;padding:1em;margin-left:1em;margin-bottom:.5em;border:1px solid #ccc;max-height:50px;overflow:hidden;-webkit-transition:max-height,.4s;transition:max-height,.4s;cursor:pointer}nav.year-filter.active{max-height:450px;overflow-y:auto;cursor:default}body.loading-references nav.year-filter.active{max-height:110px;overflow:hidden}nav.year-filter h3{position:relative;cursor:pointer}nav.year-filter h6 a{display:block;padding:.2em 1em}nav.year-filter h6 a:hover{background:#f0f0f0;text-decoration:none}nav.year-filter h6 a.active,nav.year-filter h6 a.active:hover{background:#ddd}nav.year-filter .spinner{position:static;margin:1em auto}"},loadYearFilterList:function(a){if(a.preventDefault(),b.$body.find(".year-filter").addClass("active"),!b.all_loaded){if(b.load_all)return;b.load_all=!0,b.params.num_entries=99,b.$body.addClass(b.loading_class),b.getReferences()}b.$body.off("click.year-filter."+b.collection_name),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle)},yearFilterToggle:function(){var c=a(this);c.hasClass("active")||a(this).addClass("active"),window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},500)},yearFilterTitleToggle:function(a){a.stopPropagation(),b.$body.find(".year-filter").toggleClass("active"),window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},500)}},window.zotero_api=b,void 0===a.event.special.inview&&(c=window.location.href.split("/"),c.pop(),c.push("jquery.inview.min.js"),b.$parent_body.append('<script src="'+c.join("/")+'"></script>'))}(window.jQuery||window.parent.jQuery);