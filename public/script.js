const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const uploadBtn = document.getElementById("uploadBtn");
const gallery = document.getElementById("gallery");

// Modal
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");

let previewItems = [];

// Preview selected images
imageInput.addEventListener("change", () => {
    previewContainer.innerHTML = "";
    previewItems = [];

    [...imageInput.files].forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const card = document.createElement("div");
            card.className = "preview-card";

            const img = document.createElement("img");
            img.src = e.target.result;

            const captionInput = document.createElement("input");
            captionInput.placeholder = "Enter caption";

            previewItems.push({ file, captionInput });

            card.appendChild(img);
            card.appendChild(captionInput);
            previewContainer.appendChild(card);
        };
        reader.readAsDataURL(file);
    });
});

// Upload images to Node.js server
uploadBtn.addEventListener("click", async () => {
    let formData = new FormData();
    let captions = [];

    previewItems.forEach(item => {
        formData.append("images", item.file);
        captions.push(item.captionInput.value || "Untitled");
    });

    formData.append("captions", JSON.stringify(captions));

    const res = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    data.forEach(item => {
        addImageToGallery(item.url, item.caption);
    });

    previewContainer.innerHTML = "";
    imageInput.value = "";
});

// Add uploaded image to gallery
function addImageToGallery(url, captionText) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = url;

    img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
    });

    const caption = document.createElement("div");
    caption.className = "caption";
    caption.innerText = captionText;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.innerText = "X";

    delBtn.addEventListener("click", async () => {
        await fetch("/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ path: url.substring(1) })
        });
        card.remove();
    });

    card.appendChild(img);
    card.appendChild(caption);
    card.appendChild(delBtn);
    gallery.appendChild(card);
}

// Close modal
closeModal.onclick = () => modal.style.display = "none";
modal.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
};
