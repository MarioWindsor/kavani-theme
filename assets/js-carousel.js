/*
 *
 *	Carousel
 *
 */

/* -- Scroll Controls -- */

document.addEventListener("DOMContentLoaded", function() {
	// console.log("Carousel Ready")
	const scollButtons = document.querySelectorAll('.scroll-button');
	scollButtons.forEach((scrollButton) => {
		scrollButton.addEventListener('click', (e) => {

			var dir = scrollButton.getAttribute('data-dir');
			var car = scrollButton.closest( ".carousel" );
			var carList = car.querySelector( ".carousel-list" );

			// var scrOffsetPX = window.getComputedStyle(document.documentElement).getPropertyValue('--container-width');

			const viewWidth = document.documentElement; // Because css variables based on non pixel values like vw , % . etc... isn't getting computed
			const viewWidthInPixels = viewWidth.offsetWidth;

			scrOffsetPX = ( viewWidthInPixels / 14 ) * 12;

			var scrOffset = parseInt(scrOffsetPX) * 0.8;
			// console.log(scrOffset);

			carList.style.scrollBehavior = "smooth";

			if ( dir == "left") {
				carList.scrollLeft -= scrOffset;
			} else if ( dir == "right") {
				carList.scrollLeft += scrOffset;
			}
			
		});
	});

});

