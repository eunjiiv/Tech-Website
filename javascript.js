let phonesData;
let selectedPhone;
const currentUser = localStorage.getItem('username');

document.getElementById('username-display').innerText = currentUser;
const profilePhoto = localStorage.getItem('profilePhoto');
if (profilePhoto) {
    document.getElementById('profile-photo').src = profilePhoto;
}

function toggleProfileUpdate() {
    const profileUpdate = document.getElementById('profile-update');
    profileUpdate.classList.toggle('hidden');
}

function updateProfile() {
    const newUsername = document.getElementById('update-username').value.trim();
    const newPhotoFile = document.getElementById('update-photo').files[0];

    if (newUsername) {
        localStorage.setItem('username', newUsername);
        document.getElementById('username-display').innerText = newUsername;
    }

    if (newPhotoFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const newPhotoURL = e.target.result;
            localStorage.setItem('profilePhoto', newPhotoURL);
            document.getElementById('profile-photo').src = newPhotoURL;
        };
        reader.readAsDataURL(newPhotoFile);
    }

    document.getElementById('profile-update').classList.add('hidden');
}

function showFavorites() {
    const favoriteListDiv = document.getElementById('favorite-list');
    favoriteListDiv.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(phoneName => {
        const phone = phonesData.find(p => p.name === phoneName);
        if (phone) {
            const phoneDiv = createPhoneElement(phone);
            favoriteListDiv.appendChild(phoneDiv);
        }
    });
    document.getElementById('favorites').classList.remove('hidden');
}

function createPhoneElement(phone) {
    const phoneDiv = document.createElement('div');
    phoneDiv.classList.add('phone');
    phoneDiv.innerHTML = `
        <img src="${phone.image}" alt="${phone.name}">
        <div class="details">
            <h3>${phone.name}</h3>
            <p>${phone.details}</p>
        </div>
    `;
    return phoneDiv;
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    window.location.href = 'frontpage.html';
}

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        phonesData = data.phones;
        displayPhones(phonesData);
    });

function displayPhones(phones) {
    const phoneList = document.getElementById('phoneList');
    phoneList.innerHTML = '';
    phones.forEach(phone => {
        const phoneDiv = document.createElement('div');
        phoneDiv.classList.add('phone');
        phoneDiv.setAttribute('onclick', `showSpecs('${phone.name}')`);
        phoneDiv.innerHTML = `
            <img src="${phone.image}" alt="${phone.name}">
            <div class="details">
                <h3>${phone.name}</h3>
                <p>${phone.details}</p>
            </div>
        `;
        phoneList.appendChild(phoneDiv);
    });
}

function filterPhones(brand) {
    const filteredPhones = brand === 'All' ? phonesData : phonesData.filter(phone => phone.brand === brand);
    displayPhones(filteredPhones);
}

function showSpecs(phoneName) {
    const selectedPhone = phonesData.find(phone => phone.name === phoneName);
    
    let priceHTML = '';
    if (selectedPhone.price) {
        priceHTML = '<h3>Price:</h3>';
        if (typeof selectedPhone.price === 'object') {
            for (const [storage, price] of Object.entries(selectedPhone.price)) {
                priceHTML += `<p>${storage}: ${price}</p>`;
            }
        } else {
            priceHTML += `<p>${selectedPhone.price}</p>`;
        }
    }

    document.getElementById('specs').innerHTML = `
        <div class="phone-details">
            <h2>${selectedPhone.name}</h2>
            <img src="${selectedPhone.image}" alt="${selectedPhone.name}">
            <p>${selectedPhone.specs}</p>
            ${priceHTML}
        </div>
    `;
    
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

function createReviewElement(review) {
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('review');
    
    const likeButton = document.createElement('button');
    likeButton.innerHTML = `👍 ${review.likes || 0}`;
    likeButton.onclick = () => likeReview(review.id);

    const dislikeButton = document.createElement('button');
    dislikeButton.innerHTML = `👎 ${review.dislikes || 0}`;
    dislikeButton.onclick = () => dislikeReview(review.id);

    reviewDiv.innerHTML = `
        <img src="${review.profile_image}" alt="${review.username}" width="40" height="40">
        <p><strong>${review.username}:</strong> ${review.review}</p>
    `;

    if (review.username === currentUser || review.username === 'Anonymous') {
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteReview(review.id);

        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.onclick = () => editReview(review.id, review.review);

        reviewDiv.appendChild(deleteButton);
        reviewDiv.appendChild(editButton);
    }

    const reactionsDiv = document.createElement('div');
    reactionsDiv.classList.add('reactions');
    reactionsDiv.appendChild(likeButton);
    reactionsDiv.appendChild(dislikeButton);

    reviewDiv.appendChild(reactionsDiv);

    return reviewDiv;
}

function addReview() {
    const newReviewContent = document.getElementById('newReview').value.trim();
    const postAnonymously = document.getElementById('anonymousReview').checked;
    if (!newReviewContent) return;

    const newReview = {
        id: Date.now().toString(),
        username: postAnonymously ? 'Anonymous' : currentUser,
        profile_image: postAnonymously ? 'anonymous-profile.png' : localStorage.getItem('profilePhoto'),
        review: newReviewContent,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
    };

    let reviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`)) || [];
    reviews.push(newReview);
    localStorage.setItem(`reviews_${selectedPhone.name}`, JSON.stringify(reviews));
    document.getElementById('newReview').value = '';
    showReviews();
}

function likeReview(reviewId) {
    let reviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`));
    let review = reviews.find(r => r.id === reviewId);

    if (review) {
        if (review.likedBy.includes(currentUser)) {
            review.likes -= 1;
            review.likedBy = review.likedBy.filter(user => user !== currentUser);
        } else {
            review.likes += 1;
            review.likedBy.push(currentUser);

            if (review.dislikedBy.includes(currentUser)) {
                review.dislikes -= 1;
                review.dislikedBy = review.dislikedBy.filter(user => user !== currentUser);
            }
        }

        localStorage.setItem(`reviews_${selectedPhone.name}`, JSON.stringify(reviews));
        showReviews();
    }
}

function dislikeReview(reviewId) {
    let reviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`));
    let review = reviews.find(r => r.id === reviewId);

    if (review) {
        if (review.dislikedBy.includes(currentUser)) {
            review.dislikes -= 1;
            review.dislikedBy = review.dislikedBy.filter(user => user !== currentUser);
        } else {
            review.dislikes += 1;
            review.dislikedBy.push(currentUser);

            if (review.likedBy.includes(currentUser)) {
                review.likes -= 1;
                review.likedBy = review.likedBy.filter(user => user !== currentUser);
            }
        }

        localStorage.setItem(`reviews_${selectedPhone.name}`, JSON.stringify(reviews));
        showReviews();
    }
}

function showReviews() {
    const reviewsDiv = document.getElementById('reviewList');
    reviewsDiv.innerHTML = '';

    const storedReviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`)) || [];
    const initialReviews = selectedPhone.reviews || [];

    initialReviews.forEach(review => {
        if (!review.id) {
            review.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
    });

    const reviews = [...initialReviews, ...storedReviews];

    reviews.forEach(review => {
        const reviewDiv = createReviewElement(review);
        reviewsDiv.appendChild(reviewDiv);
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close Reviews';
    closeBtn.onclick = closeReviews;
    reviewsDiv.appendChild(closeBtn);

    document.getElementById('reviews').style.display = 'block';
}

function deleteReview(reviewId) {
    let reviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`));
    reviews = reviews.filter(review => review.id !== reviewId);
    localStorage.setItem(`reviews_${selectedPhone.name}`, JSON.stringify(reviews));
    showReviews();
}

function editReview(reviewId, currentReviewContent) {
    const newReviewContent = prompt('Edit your review:', currentReviewContent);
    if (newReviewContent) {
        let reviews = JSON.parse(localStorage.getItem(`reviews_${selectedPhone.name}`));
        let review = reviews.find(r => r.id === reviewId);
        if (review) {
            review.review = newReviewContent;
            localStorage.setItem(`reviews_${selectedPhone.name}`, JSON.stringify(reviews));
            showReviews();
        }
    }
}

function closeReviews() {
    document.getElementById('reviews').style.display = 'none';
}

function addToFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteIndex = favorites.indexOf(selectedPhone.name);

    if (favoriteIndex === -1) {
        favorites.push(selectedPhone.name);
        showNotification(`${selectedPhone.name} added to favorites.`);
    } else {
        favorites.splice(favoriteIndex, 1);
        showNotification(`${selectedPhone.name} removed from favorites.`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function removeFromFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (selectedPhone && favorites.includes(selectedPhone.name)) {
        const index = favorites.indexOf(selectedPhone.name);
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Removed from favorites');
    }
}

function closeFavorites() {
    document.getElementById('favorites').classList.add('hidden');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'flex' : 'none';
}

function sendMessage(event) {
    if (event.key === 'Enter') {
        const userInput = document.getElementById('chat-input').value.trim();
        if (userInput) {
            addChatMessage('username', currentUser, userInput);
            getChatbotResponse(userInput);
            document.getElementById('chat-input').value = '';
        }
    }
}

function addChatMessage(sender, username, message) {
    const chatContent = document.getElementById('chat-content');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const profilePic = document.createElement('img');
    profilePic.src = profilePhoto || 'default-profile.png';
    profilePic.alt = 'Profile Icon';
    profilePic.classList.add('profile-pic');

    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');
    messageBubble.innerText = message;

    messageDiv.appendChild(profilePic);
    messageDiv.appendChild(messageBubble);

    chatContent.appendChild(messageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function getChatbotResponse(userInput) {
    const response = generateChatbotResponse(userInput);
    setTimeout(() => addChatMessage('chatbot', 'Chatbot', response), 500);
}

function generateChatbotResponse(userInput) {
    const lowercaseInput = userInput.toLowerCase();
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (lowercaseInput.includes('help')) {
        return 'Sure, I can help you. What do you need assistance with?';
    } else if (lowercaseInput.includes('favorite')) {
        return 'You can view and manage your favorites by clicking on the Favorites button in the profile dropdown.';
    } else if (lowercaseInput.includes('review')) {
        return 'To add a review, navigate to the product page and click on the "Add Review" button.';
    } else if (lowercaseInput.includes('update profile')) {
        return 'To update your profile, go to your profile page and click on the "Edit Profile" button.';
    } else if (lowercaseInput.includes('contact support')) {
        return 'You can contact support by clicking on the "Contact Support" link at the bottom of the page.';
    } else if (lowercaseInput.includes('log out')) {
        return 'To log out, click on your profile icon at the top right corner and select "Log Out" from the dropdown menu.';
    } else {
        return 'I\'m not sure how to help with that. Please ask a different question or contact support.';
    }
}
