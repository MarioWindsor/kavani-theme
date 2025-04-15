
/*
 *
 * This script handles embedding of videos
 *
 */

/*
 * Inject iframes into the video containers.
 * 	These iframes hold urls to the videos hosted on YouTube.
 */
function initialiseVideoEmbeds () {
	$( ".js_video_embed" ).each( function ( _i, el ) {
		var $iframe = $( "<iframe>" )
		var attributes = {
			// Add the origin parameter
	 		// This is to protect against malicious third-party JavaScript being
	 		// injected into the page and hijacking control of the YouTube player.
			src: "https://www.youtube.com/embed/" + el.dataset.src + "?html5=1&color=white&disablekb=1&fs=0&autoplay=0&loop=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&origin=" + location.origin,
			frameborder: 0,
			allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
			allowfullscreen: ""
		};
		if ( $( el ).hasClass( "js_video_get_player" ) )
			attributes.src += "&enablejsapi=1&mute=1&controls=0";
		$iframe.attr( attributes );
		$( el ).append( $iframe );
	} );
}

/*
 * Sets the containing iframe's src attribute
 * 	to what's in its equivalent data attribute
 */
function setVideoEmbed ( domEl ) {
	var $el = $( domEl );
	var src = $el.find( "iframe" ).data( "src" );
	if ( src )
		$el.find( "iframe" ).attr( "src", src );
}

/*
 * Unsets the containing iframe's src attribute to an empty value
 */
function unsetVideoEmbed ( domEl ) {
	var $el = $( domEl );
	var src = $el.find( "iframe" ).attr( "src" );
	$el.find( "iframe" ).data( "src", src );
}

/*
 * Setup the YouTube Iframe API
 * Store references to video players
 * 	in data attributes of their respective video containers.
 */
function setupYoutubePlayers () {

	// If there isn't a background YouTube embed, move on
	if ( $( ".js_video_get_player" ).length == 0 )
		return;

	// If there is a background YouTube embed, then
	// 1. Load the YouTube API library (asynchronously)
	//  	reference: https://developers.google.com/youtube/iframe_api_reference
	var scriptElement = document.createElement( "script" );
	scriptElement.src = "https://www.youtube.com/iframe_api";
	$( "script" ).last().after( scriptElement );

	// 2. Setup the YouTube video, its playback options and hooks event handling
	function onYouTubeIframeAPIReady () {
		$( ".js_video_get_player iframe" ).each( function ( _i, domVideo ) {
			new YT.Player( domVideo, {
				events: {
					onReady: onPlayerReady,
					onStateChange: onPlayerStateChange
				}
			} );
		} );
	}
	// This function needs to exposed as a global
	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

	// When the YouTube video player is ready, this function is run
	function onPlayerReady ( event ) {
		var $videoContainer = $( event.target.getIframe() ).closest( ".js_video_get_player" );
		$videoContainer.data( "player", event.target );
		if ( $videoContainer.data( "autoplay" ) === true )
			event.target.playVideo();
	}

	// Whenever the YouTube video player's state changes, this function is run
	function onPlayerStateChange ( event ) {
		var domVideo = event.target.getIframe();
		var $video = $( domVideo );
		var $videoContainer = $video.closest( ".js_video_get_player" );
		var loopVideo = $videoContainer.data( "loop" ) === true;
		if ( event.data == YT.PlayerState.PLAYING )
			$videoContainer.find( ".video-embed-placeholder" ).addClass( "opacity-0" );
		if ( loopVideo && event.data == YT.PlayerState.ENDED )
			event.target.seekTo( 0 )
	}

}

$( function () {

	// Wait for a bit
	waitFor( 3 )
		.then( function () {
			// Initialize, load and setup the video embeds and their players
			initialiseVideoEmbeds();
			setupYoutubePlayers();
		} )

} );
