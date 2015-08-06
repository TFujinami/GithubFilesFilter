// ==UserScript==
// @name         github files filter userscript
// @namespace    http://r-ism.com/tfujinami/
// @version      1.20150805
// @description  github files filter userscript
// @match        https://github.com/*
// @copyright    2015+, Tsuyoshi Fujinami
// @require      https://code.jquery.com/jquery-latest.min.js
// @require      https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js
// ==/UserScript==

(function(){
	var getExtension = function(text){
		var file_path = text.trim();
		var directory_split = file_path.split('/');
		var file_name = directory_split.pop();
		var extension_split = file_name.split('.');
		var file_extension = extension_split.pop();
		return file_extension;
	}

	// クリック処理
	$('#js-repo-pjax-container').on('click', '.tfFileFilter-trigger', function(){
		var trigger = $(this);
		trigger.toggleClass('is-disabled');
		var extension = trigger.text();
		if (trigger.hasClass('is-disabled')){
			$.cookie(extension, 'hide', { path: '/' });
		} else {
			$.cookie(extension, 'show', { path: '/' });
		}
		$(window).trigger('update');
	});

	var setFilter = function(object, extension){
		var view_flag = false;
		$('.tfFileFilter .tfFileFilter-trigger:not(.is-disabled)').each(function(){
			var filter = $(this);
			var filter_extension = filter.text();

			if (extension == filter_extension){
				view_flag = true;
				return false;
			}
		});

		if (view_flag){
			object.removeClass('is-hidden');
		} else {
			object.addClass('is-hidden');
		}
	}

	$.fn.getTextNode = function(){
		var clone = $(this).clone();
		clone.find('*').remove();
		return clone.text().trim();
	}

	// フィルター表示
	$(window).on('update', function(){
		// フィルターリスト
		$('.tfFileFilter .tfFileFilter-trigger').each(function(){
			var filter = $(this);
			var filter_extension = filter.text();
			if ($.cookie(filter_extension) == 'hide'){
				filter.addClass('is-disabled');
			} else {
				filter.removeClass('is-disabled');
			}
		});

		// ファイルリスト
		$('.content li').each(function(){
			var target = $(this);
			var extension = getExtension(target.find('.octicon + a').text());
			setFilter(target, extension);
		});

		// ファイル個別
		$('#files .file').each(function(){
			var target = $(this);
			var extension = getExtension(target.find('.js-selectable-text').getTextNode());
			setFilter(target, extension);
		});	
	});

	// スタイル作成
	var style = (function(){/*
	.tfFileFilter {
		display: inline-block;
		margin: 0; // reset
		list-style: none;
	}
	.tfFileFilter:before {
		content: '\00a0[ filter:\00a0';
	}
	.tfFileFilter:after {
		content: '\00a0]';
	}
	.tfFileFilter-list {
		display: inline-block;
		padding: 0 !important; // reset
	}
	.tfFileFilter-list + .tfFileFilter-list {
		border: 0 !important; // reset
	}
	.tfFileFilter-list:not(:first-child):before {
		content: '\00a0|\00a0';
	}
	.tfFileFilter-trigger.is-disabled {
		color: #aaa;
	}
	.is-hidden {
		display: none;
	}
	*/}).toString().match(/\/\*([^]*)\*\//)[1];
	$('head').append( $('<style></style>').attr('type','text/css').text(style) );

	// GitHubはページ遷移がAJAX+PushStateな作りっぽいので、ループ監視してる
	setInterval(function(){
		$(window).trigger('update');
		if ($('.tfFileFilter-list').size() != 0){ return; }

		// ファイル拡張子抽出
		var extensions = [];
		$('.content li .octicon + a').each(function(i){
			var file_extension = getExtension($(this).text());
			extensions.push(file_extension);
		});
		var extensions = extensions.filter(function(x, i, self){
			return self.indexOf(x) === i;
		});

		// HTML生成
		$.each(extensions, function(i, extension){
			$('.toc-diff-stats').append( $('<a></a>').attr('href', 'javascript:void(0);').addClass('tfFileFilter-trigger').text(extension) );
		});
		$('.tfFileFilter-trigger').wrap( $('<li></li>').addClass('tfFileFilter-list') );
		$('.tfFileFilter-list').wrapAll( $('<ul></ul>').addClass('tfFileFilter') );

		$(window).trigger('update');
	}, 3000);
})();
