(function() {
	'use strict'
	var currentPage = window.location.href;
	
	$('.fb').click(function(){
		var fbShare = "http://www.facebook.com/sharer/sharer.php?u=" + currentPage;
		window.open(fbShare);
	})
	$('.gp').click(function(){
		var gpShare = "https://plus.google.com/share?url=" + currentPage;
		window.open(gpShare);
	})
	$('.linkedin').click(function(){
		var linkedinShare = "https://www.linkedin.com/cws/share?url=" + currentPage;
		window.open(linkedinShare);
	})
	$('.twitter').click(function(){
		var twitterShare = "http://www.twitter.com/share?url=" + currentPage;
		window.open(twitterShare);
	})
	$('.pinterest').click(function(){
		var pinterestShare = "http://pinterest.com/pin/create/button/?url=" + currentPage;
		window.open(pinterestShare);
	})
}());