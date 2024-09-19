const apiKey = 'NWuZ56lfq0y9jBh4SsjMwA43873'; 

async function findServices() {
    const postcode = encodeURIComponent(document.getElementById('postcodeInput').value.trim());

    if (!postcode) {
        alert('Please enter your postcode.');
        return;
    }

    try {
        console.log(`Fetching information for postcode: ${postcode}`);
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Data received from API:', data);

        if (data && data.result) {
            displayCouncilInfo(data.result);
            const houseNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]; 
            populateAddressDropdown(houseNumbers, data.result);
        } else {
            console.error('No result found for this postcode:', data);
            document.getElementById('councilInfo').innerHTML = `<p>No council information found for this postcode.</p>`;
        }
    } catch (error) {
        console.error('Error fetching council data:', error);
        document.getElementById('councilInfo').innerHTML = `<p>Error fetching council information. Please check the console for more details.</p>`;
    }
}

function displayCouncilInfo(result) {
    const councilInfo = document.getElementById('councilInfo');
    councilInfo.innerHTML = `
        <h3>Local Council Information</h3>
        <p><strong>District:</strong> ${result.admin_district}</p>
        <p><strong>County:</strong> ${result.admin_county}</p>
        <p><strong>Ward:</strong> ${result.admin_ward}</p>
    `;
}

function populateAddressDropdown(houseNumbers, result) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';

    const addressSelection = document.createElement('select');
    addressSelection.id = 'addressSelection';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Your Address';
    addressSelection.appendChild(defaultOption);

    houseNumbers.forEach((number) => {
        const option = document.createElement('option');
        option.value = number;
        option.text = `${number}, ${result.admin_district}`;
        addressSelection.appendChild(option);
    });

    addressList.appendChild(addressSelection);
    addressSelection.addEventListener('change', () => {
        displayCompleteAddress(result);
        document.getElementById('dateTimeSection').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
    });

    document.getElementById('uploadSection').style.display = 'block';
}

function displayCompleteAddress(result) {
    const selectedHouseNumber = document.getElementById('addressSelection').value;
    if (selectedHouseNumber) {
        const completeAddress = `${selectedHouseNumber}, ${result.admin_district}, ${result.admin_county}, ${result.admin_ward}`;
        const addressDisplay = document.getElementById('completeAddress');
        addressDisplay.innerText = `Selected Address: ${completeAddress}`;
        addressDisplay.style.display = 'block';
    }
}

function handleImageUpload(event) {
    const fileInput = document.getElementById('imageInput');
    const imageDisplaySection = document.getElementById('imageDisplay');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imageDisplaySection.innerHTML = ''; 

            const img = document.createElement('img');
            img.src = e.target.result; 
            img.style.maxWidth = '300px';
            img.style.maxHeight = '300px';
            img.style.marginTop = '10px';

            imageDisplaySection.appendChild(img); 

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete Image';
            deleteButton.style.marginTop = '10px';
            deleteButton.onclick = () => {
                imageDisplaySection.innerHTML = ''; 
                fileInput.value = ''; 
            };
            imageDisplaySection.appendChild(deleteButton); 
        };

        reader.readAsDataURL(fileInput.files[0]); 
    }
}

function storeInBasket(data) {
    let basket = JSON.parse(localStorage.getItem('basket')) || [];
    basket.push(data);
    localStorage.setItem('basket', JSON.stringify(basket));
}

function redirectToConfirmation() {
    window.location.href = 'confirmation.html';
}

async function submitInformation() {
    const postcode = document.getElementById('postcodeInput').value.trim();
    const selectedAddress = document.getElementById('completeAddress').innerText.replace('Selected Address: ', '');
    const collectionDate = document.getElementById('collectionDate').value;
    const collectionTime = document.getElementById('collectionTime').value;
    const imageData = document.getElementById('imageDisplay').querySelector('img') ? 
                      document.getElementById('imageDisplay').querySelector('img').src : '';

    const requestData = {
        postcode,
        selectedAddress,
        collectionDate,
        collectionTime,
        imageData,
        cost: 20 
    };

    storeInBasket(requestData);
    
    redirectToConfirmation();
}


function displayConfirmation() {
    const basket = JSON.parse(localStorage.getItem('basket'));
    const confirmationDetails = document.getElementById('confirmationDetails');

    if (basket && basket.length > 0) {
        const { postcode, selectedAddress, collectionDate, collectionTime, imageData } = basket[0];

        confirmationDetails.innerHTML = `
            <p><strong>Postcode:</strong> ${postcode || 'N/A'}</p>
            <p><strong>Selected Address:</strong> ${selectedAddress || 'N/A'}</p>
            <p><strong>Preferred Collection Date:</strong> ${collectionDate || 'N/A'}</p>
            <p><strong>Preferred Collection Time:</strong> ${collectionTime || 'N/A'}</p>
            <p><strong>Uploaded Image:</strong></p>
            <div>${imageData ? `<img src="${imageData}" alt="Uploaded Image" />` : 'No image uploaded'}</div>
        `;
    } else {
        confirmationDetails.innerHTML = `<p>No information found.</p>`;
    }
}


if (document.title === 'Confirmation Page') {
    displayConfirmation();
}
