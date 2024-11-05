document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('urlInput');
    const aliasInput = document.getElementById('aliasInput');
    const urlList = document.getElementById('urlList');
    const saveUrlButton = document.getElementById('saveUrlButton');
    const clearInputsButton = document.getElementById('clearInputsButton');
    const openUrlsBtn = document.getElementById('openUrls');

    // Load saved URLs
    chrome.storage.sync.get('urls', (data) => {
        const urls = data.urls || [];
        urls.forEach(({url, alias}) => addUrlToList(url, alias));
    });

    // Save URL
    saveUrlButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        const alias = aliasInput.value.trim() || url;

        if (url) {
            chrome.storage.sync.get('urls', (data) => {
                const urls = data.urls || [];
                urls.push({url, alias});
                chrome.storage.sync.set({urls});
                addUrlToList(url, alias);
                urlInput.value = '';
                aliasInput.value = '';
            });
        }
    });

    // Clear input fields
    clearInputsButton.addEventListener('click', () => {
        urlInput.value = '';
        aliasInput.value = '';
    });

    // Open all URLs
    openUrlsBtn.addEventListener('click', () => {
        chrome.storage.sync.get('urls', (data) => {
            const urls = data.urls || [];
            urls.forEach(({url}) => {
                const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
                chrome.tabs.create({url: validUrl});
            });
        });
    });

    // Helper function to add URL with alias and controls
    function addUrlToList(url, alias) {
        const li = document.createElement('li');

        const aliasDisplay = document.createElement('span');
        aliasDisplay.classList.add('alias-display');
        aliasDisplay.textContent = alias;
        aliasDisplay.style.fontWeight = 'bold'; // Make alias bold

        const urlDisplay = document.createElement('span');
        urlDisplay.classList.add('url-display');
        urlDisplay.textContent = url;

        const urlControls = document.createElement('div');
        urlControls.classList.add('url-controls');

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.classList.add('btn-edit');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editUrl(url, alias, li));

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn-delete');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => removeUrl(url, li));

        urlControls.appendChild(editBtn);
        urlControls.appendChild(deleteBtn);

        li.appendChild(aliasDisplay);
        li.appendChild(urlDisplay);
        li.appendChild(urlControls);
        urlList.appendChild(li);
    }

    // Edit URL function
    function editUrl(url, alias, li) {
        const aliasInput = document.createElement('input');
        const urlInput = document.createElement('input');
        aliasInput.type = 'text';
        aliasInput.value = alias;
        aliasInput.classList.add('input-edit');
        aliasInput.style.width = '100%';

        urlInput.type = 'text';
        urlInput.value = url;
        urlInput.classList.add('input-edit');
        urlInput.style.width = '100%';

        li.innerHTML = '';
        li.appendChild(aliasInput);
        li.appendChild(urlInput);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('btn-save');
        saveBtn.style.width = '100%';
        saveBtn.addEventListener('click', () => {
            const newAlias = aliasInput.value.trim();
            const newUrl = urlInput.value.trim();
            chrome.storage.sync.get('urls', (data) => {
                const urls = data.urls || [];
                const index = urls.findIndex((item) => item.url === url);
                if (index !== -1) {
                    urls[index] = {url: newUrl, alias: newAlias};
                    chrome.storage.sync.set({urls});
                    li.innerHTML = '';
                    addUrlToList(newUrl, newAlias);
                }
            });
        });

        li.appendChild(saveBtn);
    }

    // Remove URL function
    function removeUrl(url, li) {
        chrome.storage.sync.get('urls', (data) => {
            const urls = data.urls || [];
            const updatedUrls = urls.filter((item) => item.url !== url);
            chrome.storage.sync.set({urls: updatedUrls});
            li.remove();
        });
    }
});
