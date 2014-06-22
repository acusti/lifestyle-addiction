!function(a){var b,c;b={defaults:{collection:"",user:"1562960",num_entries:20,start:0,zotero_options:"format=atom&content=json,bib&style=apa&order=date&sort=desc",ip:!1},params:{},callback:{},collection_name:window.location.pathname.split("/").pop().replace("archive-","").replace("monitoring-","").replace(".html",""),feed_base:"https://api.zotero.org/users/",namespace:"zapi\\:",lang:"en",$body:a(document.body),$window:a(window),$parent_body:a("body"),$footer:a(".c-back-to-top"),$year_filter:a(),$year_links:a(),$year_sections:a(),quarter_labels:{en:["Jan - Mar","April - June","July - Sept","Oct - Dec"],fr:["Jan - Mars","Avril - Juin","Juil - Sept","Oct - Dec"]},years:[],total:!1,is_init:!0,is_all_loading:!1,is_all_loaded:!1,loading_class:"loading-references",loading_indicator_styles:"",loading_indicator_html:"",monitoring_css:'.year-filter{width:24%;min-width:145px;float:right;margin:0 0 .5em .25em}.year-filter .item{position:relative;max-height:50px;overflow:hidden;cursor:pointer}.year-filter.active .item{max-height:450px;overflow-y:auto;cursor:default}body.loading-references .year-filter.active .item{max-height:110px;overflow:hidden}.year-filter .spinner{position:static;margin:1em auto}.year-filter h3{position:relative;cursor:pointer}.year-filter h6 a{display:block;padding:.2em 1em}.quarter-filter.is-enabled:hover,.year-filter h6 a:hover{background:#f0f0f0;cursor:pointer}.quarter-filter.active,.quarter-filter.active:hover,.year-filter h6 a.active,.year-filter h6 a.active:hover{background:#ddd}.quarters{float:left;margin-left:9px;margin-top:20px;line-height:42px}#boot .year-section h2{margin-top:20px}#boot .year-section.first h2,#boot.filtered .year-section h2{margin-top:0}#boot .year-section h6{margin-top:1em}.filtered .year-section .quarters,.year-section.first .quarters{margin-top:0}.quarter-filter{border:1px solid #e5e5e5;font-weight:700;font-size:13px;padding:.25em .35em;margin:0 .25em;-ms-filter:"alpha(Opacity=50)";filter:alpha(opacity=50);opacity:.5}.quarter-filter.is-enabled{-ms-filter:"alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1}h2.quarterly{float:left}.ref-entry{clear:left}#boot .year-filter h6 a:hover{text-decoration:none}#boot .year-filter.active .item:hover{background-color:transparent}',year_filter_html:"",tab_height_timeout:"",fixTabHeight:function(){window.clearTimeout(b.tab_height_timeout),b.tab_height_timeout=window.setTimeout(function(){b.$window.off("resize.tabs."+b.collection_name),window.frameElement.height=b.tab_height=b.$body.parent().height()+50,window.setTimeout(function(){b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight)},200)},200)},filterByType:function(b){return function(){return a(this).attr("zapi:type")===b}},buildParams:function(c){b.params=a.extend({},b.defaults,c),b.params.quarterly&&(b.params.num_entries=99)},getFeedUrl:function(){var a=b.feed_base;return a+=b.params.user+"/collections/"+b.params.collection+"/items?"+b.params.zotero_options+"&start="+b.params.start+"&limit="+b.params.num_entries,a+="&cb="+(new Date).toDateString(),b.params.q&&(a+="&q="+b.params.q+"&qmode=titleCreatorYear"),"https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&num="+b.params.num_entries+(b.params.ip?"&userip="+b.params.ip:"")+"&q="+encodeURIComponent(a)},getReferences:function(c,d){if(c&&(b.buildParams(c),d&&(b.callback=d),"fr"===parent.window.location.pathname.substr(1).split("/").shift()&&(b.lang="fr")),b.is_init&&b.initialize(),!b.is_all_loaded){var e=b.getFeedUrl();b.$body.hasClass("ready")||(a(document).find("head").append("<style>"+b.monitoring_css+"\n"+b.loading_indicator_styles+"</style>"),b.$body.addClass("ready")),"spinner"!==b.$footer.prev()[0].className&&(a("head").append("<style>"+b.loading_indicator_styles+"</style>"),b.$footer.before(b.loading_indicator_html)),b.$parent_body.addClass(b.loading_class),a.ajax({url:e,dataType:"jsonp",success:function(c){if(!c.responseData||!c.responseData.xmlString)return b.getReferences(),!1;var d,e,f,g,h,i,j,k,l=a(a.parseXML(c.responseData.xmlString)),m=l.find("entry"),n=m.length,o=0,p="",q="",r="",s="",t=!1,u=[];for(b.total===!1&&(b.total=l.find(b.namespace+"totalResults"),b.total.length||(b.namespace="",b.total=l.find(b.namespace+"totalResults")),b.total=b.total.length?parseInt(b.total.text(),10):!1);n>o;o++){if(f=a(m[o]),j=a.parseJSON(f.find(b.namespace+"subcontent").filter(b.filterByType("json")).text()),k="ref-entry",q=f.find(b.namespace+"year").text(),t=b.years[b.years.length-1]!==q,(!p.length||t)&&q&&(b.years.length&&p.length&&(p+="</div>"),r="year-section "+q,b.years.length||(r+=" first"),p+='<div class="'+r+'">',t)){if(b.params.quarterly&&(s=' class="quarterly"'),p+='<h2 id="year-'+q+'"'+s+">"+q+"</h2>",b.years.push(q),b.params.quarterly){for(p+='<div class="quarters">',d=0;4>d;d++)p+='<span class="quarter-filter" data-quarter="'+d+'">'+b.quarter_labels[b.lang][d]+"</span>";p+="</div>"}b.years.length>1&&u.push(b.years[b.years.length-2])}b.params.quarterly&&(e=b.strToDate(j.date).month,"number"!=typeof e&&(e=0),k+=" year-"+q+" quarter-"+Math.floor(e/3)),p+='<div class="'+k+'">',p+="<h6>"+(j.url?'<a href="'+j.url+'" target="_blank">':"")+j.title+(j.url?"</a>":"")+"</h6>",g=f.find(b.namespace+"subcontent").filter(b.filterByType("bib")).children("div"),g.length&&(h=g[0].outerHTML,j.url&&(i=h.lastIndexOf(" from http://"),-1===i&&(i=h.lastIndexOf(" from https://")),-1!==i&&(i=h.substring(0,i).lastIndexOf(" Retrieved"),-1!==i&&(h=h.substring(0,i)+h.substring(h.indexOf("</div>"))))),p+=h),p+="</div>"}p+="</div>",b.is_init&&(p=b.year_filter_html+p),b.callback(p),b.is_init&&(b.is_init=!1,b.$year_filter=b.$body.find(".year-filter"),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.loadYearFilterList),b.$body.on("references-load."+b.collection_name,function(){var c="",d=0,e=b.years.length;for(b.$year_filter=b.$body.find(".year-filter"),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.off("click.year-filter."+b.collection_name).on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle),b.$year_sections=b.$body.find(".year-section");e>d;d++)4===b.years[d].length&&(c+='<h6><a class="year-link" href="#year-'+b.years[d]+'">'+b.years[d]+"</a></h6>");b.$year_filter.find(".group").append(c),b.$year_links=b.$year_filter.find("a.year-link"),b.$year_links.on("click."+b.collection_name,function(c){c.preventDefault();var d=a(this),e="";b.$year_links.not(d).removeClass("active"),d.toggleClass("active"),d.hasClass("active")?(e="."+this.innerHTML,b.$body.addClass("filtered"),b.$year_sections.not(e).removeClass("active").fadeOut(),b.$year_sections.filter(e).addClass("active").fadeIn()):(b.$body.removeClass("filtered"),b.$year_sections.fadeIn()),window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},300)}),b.$body.off("references-load."+b.collection_name),window.setTimeout(function(){b.$body.removeClass(b.loading_class)},200),b.$year_filter.hasClass("active")&&b.$window.trigger("change-height.tabs."+b.collection_name),window.setTimeout(function(){b.setupQuarterFilters(b.years)},200)})),b.is_init=!1,b.$parent_body.removeClass(b.loading_class),b.$window.on("resize.tabs."+b.collection_name,b.fixTabHeight).trigger("resize.tabs."+b.collection_name),b.total===!1||b.params.start+b.params.num_entries<b.total?b.params.quarterly&&!b.is_all_loading?(b.getNextReferences(!0),b.getAllReferences()):b.getNextReferences():(u.push(q),b.is_all_loaded=!0,b.$body.trigger("references-load."+b.collection_name)),u.length&&b.setupQuarterFilters(u)}})}},getNextReferences:function(c){return b.is_all_loading||c?(b.params.start+=b.params.num_entries,b.params.start===b.params.num_entries&&(b.params.num_entries=99),void(b.is_all_loading?b.getReferences():b.$footer.on("inview."+b.collection_name,function(){a(".tab-pane.active").attr("id")===b.collection_name&&(b.$footer.off("inview."+b.collection_name),b.getReferences())}))):void window.setTimeout(function(){b.getNextReferences(!0)},500)},getAllReferences:function(){b.is_all_loaded||b.is_all_loading||(b.is_all_loading=!0,b.params.num_entries=99,b.$body.addClass(b.loading_class),b.getReferences())},initialize:function(){b.prepareMarkup(),a.ajax({url:"http://www.telize.com/jsonip",dataType:"jsonp",success:function(a){b.params.ip=a.ip}}),b.$window.on("change-height.tabs."+b.collection_name,function(){window.setTimeout(function(){b.$window.trigger("resize.tabs."+b.collection_name)},500)})},prepareMarkup:function(){b.loading_indicator_styles=".spinner { display: none; position: absolute; left: 45%; width: 50px; height: 30px; text-align: center; font-size: 10px; } body."+b.loading_class+" .spinner { display: block; } .spinner > div { background-color: #333; height: 100%; width: 6px; margin: 0 1px; display: inline-block;  -webkit-animation: stretchdelay 1.2s infinite ease-in-out; animation: stretchdelay 1.2s infinite ease-in-out; } .spinner .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .spinner .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .spinner .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .spinner .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% {  transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }",b.loading_indicator_html='<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>',b.year_filter_html='<nav class="year-filter c-accordion"><div class="item"><span class="group"><h3>Archive <div class="arrow"></div></h3>'+b.loading_indicator_html+"</span></div></nav>"},loadYearFilterList:function(a){a.stopPropagation(),b.yearFilterAddActive(),(b.is_all_loaded||!b.is_all_loading)&&(b.$body.off("click.year-filter."+b.collection_name),b.$body.on("click.year-filter."+b.collection_name,".year-filter",b.yearFilterToggle),b.$body.on("click.year-filter."+b.collection_name,".year-filter h3",b.yearFilterTitleToggle))},yearFilterToggle:function(a){a.stopPropagation(),b.yearFilterAddActive(),b.$window.trigger("change-height.tabs."+b.collection_name)},yearFilterTitleToggle:function(a){a.stopPropagation(),b.yearFilterToggleActive(),b.$window.trigger("change-height.tabs."+b.collection_name)},yearFilterAddActive:function(a){return a=a||b.$body.find(".year-filter"),a.hasClass("active")?!1:(a.addClass("active"),a.find(".item").addClass("open"),!0)},yearFilterToggleActive:function(a){a=a||b.$body.find(".year-filter"),b.yearFilterAddActive(a)||(a.removeClass("active"),a.find(".item").removeClass("open"))},setupQuarterFilters:function(a){var c,d,e,f=0,g=a.length;if(b.params.quarterly&&g)for(;g>f;f++)if(4===a[f].length&&(c=b.$body.find(".year-section."+a[f]+" .quarters"),d=[],e=0,c.length)){for(;4>e;e++)d[e]=b.$body.find(".year-section."+a[f]+" .quarter-"+e),d[e].length&&c.find('[data-quarter="'+e+'"]').addClass("is-enabled");b.attachQuarterFilterToggle(c,d)}},attachQuarterFilterToggle:function(c,d){c.find(".quarter-filter.is-enabled").off("click.quarter-filter."+b.collection_name).on("click.quarter-filter."+b.collection_name,function(){var e,f=a(this),g="";if(c.find(".quarter-filter").not(f).removeClass("active"),f.toggleClass("active"),f.hasClass("active"))for(g=parseInt(f.data("quarter"),10),e=0;4>e;e++)e!==g?d[e].fadeOut():d[e].fadeIn();else for(e=0;4>e;e++)e!==g&&d[e].fadeIn();b.$window.trigger("change-height.tabs."+b.collection_name)})}},window.zotero_api=window.zotero_api||{},window.zotero_api=a.extend(b,window.zotero_api),void 0===a.event.special.inview&&(c=window.location.href.split("/"),c.pop(),c.push("jquery.inview.min.js"),b.$parent_body.append('<script src="'+c.join("/")+'"></script>'))}(window.jQuery||window.parent.jQuery),function(){var a=/^(.*?)\b([0-9]{1,4})(?:([\-\/\.\u5e74])([0-9]{1,2}))?(?:([\-\/\.\u6708])([0-9]{1,4}))?((?:\b|[^0-9]).*?)$/,b=/^(.*?)\b((?:circa |around |about |c\.? ?)?[0-9]{1,4}(?: ?B\.? ?C\.?(?: ?E\.?)?| ?C\.? ?E\.?| ?A\.? ?D\.?)|[0-9]{3,4})\b(.*?)$/i,c=null,d=null,e="CA",f=function(f){var h={order:""};if(!f)return h;var i,j,k=[];f=f.toString().replace(/^\s+|\s+$/g,"").replace(/\s+/," ");var l=a.exec(f);if(l&&(!l[5]||!l[3]||l[3]==l[5]||"年"==l[3]&&"月"==l[5])&&(l[2]&&l[4]&&l[6]||!l[1]&&!l[7])){if(3==l[2].length||4==l[2].length||"年"==l[3]?(h.year=l[2],h.month=l[4],h.day=l[6],h.order+=l[2]?"y":"",h.order+=l[4]?"m":"",h.order+=l[6]?"d":""):l[2]&&!l[4]&&l[6]?(h.month=l[2],h.year=l[6],h.order+=l[2]?"m":"",h.order+=l[6]?"y":""):("US"==e||"FM"==e||"PW"==e||"PH"==e?(h.month=l[2],h.day=l[4],h.order+=l[2]?"m":"",h.order+=l[4]?"d":""):(h.month=l[4],h.day=l[2],h.order+=l[2]?"d":"",h.order+=l[4]?"m":""),h.year=l[6],h.order+="y"),h.year&&(h.year=parseInt(h.year,10)),h.day&&(h.day=parseInt(h.day,10)),h.month&&(h.month=parseInt(h.month,10),h.month>12)){var m=h.day;h.day=h.month,h.month=m,h.order=h.order.replace("m","D").replace("d","M").replace("D","d").replace("M","m")}if((!h.month||h.month<=12)&&(!h.day||h.day<=31)){if(h.year&&h.year<100){var n=new Date,o=n.getFullYear(),p=o%100,q=o-p;h.year=h.year<=p?q+h.year:q-100+h.year}h.month&&h.month--,k.push({part:l[1],before:!0},{part:l[7]})}else h={order:""},k.push({part:f})}else k.push({part:f});if(!h.year)for(j in k)if(l=b.exec(k[j].part)){h.year=l[2],h.order=g(h.order,"y",k[j]),k.splice(j,1,{part:l[1],before:!0},{part:l[3]});break}if(!h.month){var r=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];c||(c=new RegExp("^(.*)\\b("+r.join("|")+")[^ ]*(?: (.*)$|$)","i"));for(j in k)if(l=c.exec(k[j].part)){h.month=r.indexOf(l[2].toLowerCase())%12,h.order=g(h.order,"m",k[j]),k.splice(j,1,{part:l[1],before:"m"},{part:l[3],after:"m"});break}}if(!h.day){if(!d){var s="";d=new RegExp("\\b([0-9]{1,2})(?:"+s+")?\\b(.*)","i")}for(j in k)if(l=d.exec(k[j].part)){var t=parseInt(l[1],10);if(31>=t){h.day=t,h.order=g(h.order,"d",k[j]),l.index>0?(i=k[j].part.substr(0,l.index),l[2]&&(i+=" "+l[2])):i=l[2],k.splice(j,1,{part:i});break}}}h.part="";for(j in k)h.part+=k[j].part+" ";return h.part&&(h.part=h.part.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g,"")),(""===h.part||void 0===h.part)&&delete h.part,(h.year||0===h.year)&&(h.year+=""),h},g=function(a,b,c){if(!a)return b;if(c.before===!0)return b+a;if(c.after===!0)return a+b;var d;return c.before?(d=a.indexOf(c.before),-1==d?a:a.replace(new RegExp("("+c.before+")"),b+"$1")):c.after?(d=a.indexOf(c.after),-1==d?a+b:a.replace(new RegExp("("+c.after+")"),"$1"+b)):a+b};window.zotero_api=window.zotero_api||{},window.zotero_api.strToDate=f}();
//# sourceMappingURL=zapi.map