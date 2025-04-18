async function readImage(contID, fileName) {
	const response = await fetch(`/images/${fileName}`, {
		method: 'GET',
	}); 
	if (response.ok){
		const imgURL = URL.createObjectURL(await response.blob());
		document.getElementById(contID).src = imgURL;
	} else {
		console.error('Failed to load image: ', fileName);
	}
}

async function readImageBackground(contID, fileName) {
	const response = await fetch(`/images/${fileName}`, {
		method: 'GET',
	});
	if (response.ok) {
		const imgURL = URL.createObjectURL(await response.blob());
		document.getElementById(contID).style.backgroundImage = `url(${imgURL})`;
	} else {
		console.error('Failed to load image: ', fileName);
	}
}

window.addEventListener('DOMContentLoaded', () => {
	readImageBackground('banner', 'banner-index.png');
});
window.addEventListener('DOMContentLoaded', () => {
	readImageBackground('about-banner', 'banner-about.png');
});
window.addEventListener('DOMContentLoaded', () => {
	readImage('client-photo', 'client-photo.png');
});
window.addEventListener('DOMContentLoaded', () => {
	readImageBackground('banner-reviews', 'banner-reviews.png');
});
window.addEventListener('DOMContentLoaded', () => {
	readImageBackground('banner-services', 'banner-services.png');
});

module.exports = {
	readImage,
	readImageBackground
};