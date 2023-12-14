export const burgerMenu = () => {
	const burger = document.querySelector('.burger')
	const mobileMenu = document.querySelector('.mobile-menu')
	const overlay = document.querySelector('.overlay')
	const body = document.querySelector('body')

	const toggleActiveClass = () => {
		burger.classList.toggle('active')
		overlay.classList.toggle('active')
		mobileMenu.classList.toggle('active')
		body.classList.toggle('disable-scroll')
	}

	burger.addEventListener('click', toggleActiveClass)

	overlay.addEventListener('click', toggleActiveClass)

	window.addEventListener('resize', () => {
		const {innerWidth} = window
		if (innerWidth > 991.98) {
			burger.classList.remove('active')
			overlay.classList.remove('active')
			mobileMenu.classList.remove('active')
			body.classList.remove('disable-scroll')
		}
	})
}
