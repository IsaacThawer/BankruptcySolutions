document.getElementById('uploadForm1').addEventListener('submit', uploadImage);

async function uploadImage(e) {
    e.preventDefault();

    const image = document.getElementById("image");
    const name = image.name;
    const formData = new FormData();
    formData.append("image", image.files[0]);

    try {
        const response = await fetch(`/upload/image/${name}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.text();
        console.log(result);
        alert(result);
    } catch (error) {
        console.error('Error:', error);
    }
};