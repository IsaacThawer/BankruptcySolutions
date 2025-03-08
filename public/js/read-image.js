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

module.exports = {
	readImage,
	readImageBackground
};