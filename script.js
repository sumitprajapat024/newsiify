const API_KEY = "d762d5bd701249f9accfbb6f86c5cb2e"; // Replace with your actual API key
const url = "https://newsapi.org/v2/everything?q=";
const pageSize = 30; // Limit articles per request
let curSelectedNav = null;

// Fetch news on page load
window.addEventListener("load", () => {
    fetchNews("India");
    fetchLatestUpdatedNews(); // Fetch latest updated news on page load
});

// Get the date 10 days ago
function getLast10DaysDate() {
    const today = new Date();
    const tenDaysAgo = new Date(today.setDate(today.getDate() - 10));
    return tenDaysAgo.toISOString().split("T")[0]; // Returns date in 'YYYY-MM-DD' format
}

// Fetch the latest news from the API with a date range of the last 10 days
async function fetchNews(query, page = 1) {
    const last10DaysDate = getLast10DaysDate(); // Get the date 10 days ago
    console.log(`Fetching news for query: ${query} | Page: ${page}`);
    
    try {
        const res = await fetch(`${url}${query}&pageSize=${pageSize}&page=${page}&from=${last10DaysDate}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`, {
            cache: "no-store" // Ensure fresh content is fetched
        });
        console.log("Response status:", res.status); // Log response status
        
        if (!res.ok) {
            throw new Error(`Error: ${res.status} - ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Fetched data:", data); // Log fetched data

        if (data.articles && data.articles.length > 0) {
            bindData(data.articles);
        } else {
            console.warn("No articles found.");
            document.getElementById("cards-container").innerHTML = "<p>No articles found for this query.</p>";
        }
    } catch (error) {
        console.error("Failed to fetch news:", error);
        alert("Unable to fetch news. Please try again later.");
    }
}

// Fetch the latest updated news articles
async function fetchLatestUpdatedNews() {
    const last10DaysDate = getLast10DaysDate();
    const query = 'latest'; // Placeholder for your latest news query

    try {
        const res = await fetch(`${url}${query}&pageSize=${pageSize}&from=${last10DaysDate}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`, {
            cache: "no-store" // Ensure fresh content is fetched
        });

        if (!res.ok) {
            throw new Error(`Error: ${res.status} - ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (data.articles && data.articles.length > 0) {
            displayLatestUpdatedNews(data.articles);
        } else {
            console.warn("No latest articles found.");
        }
    } catch (error) {
        console.error("Failed to fetch latest updated news:", error);
        alert("Unable to fetch latest updated news. Please try again later.");
    }
}

// Display the latest updated news articles
function displayLatestUpdatedNews(articles) {
    const latestUpdatedContainer = document.getElementById("latest-updated-container");
    latestUpdatedContainer.innerHTML = ""; // Clear existing content

    articles.forEach(article => {
        const latestNewsItem = document.createElement("div");
        latestNewsItem.classList.add("latest-news-item");
        latestNewsItem.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <p>Source: ${article.source.name} | Published: ${new Date(article.publishedAt).toLocaleString()}</p>
        `;
        
        latestNewsItem.addEventListener("click", () => {
            window.open(article.url, "_blank");
        });
        
        latestUpdatedContainer.appendChild(latestNewsItem);
    });
}

// Bind data to the template and display it
function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    // Clear existing news
    cardsContainer.innerHTML = "";

    // Populate the template with news data
    articles.forEach((article) => {
        if (!article.urlToImage) return; // Skip if no image
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });

    // Lazy load images
    lazyLoadImages();
}

// Fill the news card with data
function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.dataset.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

// Handle navigation item click
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

// Handle search button click
const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

// Debounce the search to avoid too many API calls
let debounceTimer;
searchText.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = searchText.value;
        if (!query) return;
        fetchNews(query);
    }, 300); // 300ms debounce
});

// Lazy loading for images
function lazyLoadImages() {
    const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        lazyImages.forEach(function (lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
}

// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
});
