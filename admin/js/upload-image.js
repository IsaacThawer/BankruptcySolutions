async function uploadImage(e) {
    e.preventDefault();

    const image = document.getElementById("image");
    const name = image.name;
    const formData = new FormData();
    formData.append("image", image.files[0]);

    
   fetch(`/upload/image/${name}`, {
       method: 'POST',
       body: formData,
   })
      .then((res) => alert("Image successfully uploaded."))
      .catch ((err) => alert("Error uploading file", err));
};