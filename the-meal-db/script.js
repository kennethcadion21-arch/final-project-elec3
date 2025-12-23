const API_BASE = "https://www.themealdb.com/api/json/v1/1";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const resultsGrid = document.getElementById("resultsGrid");
const errorEl = document.getElementById("error");
const themeToggle = document.getElementById("themeToggle");
const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");

const mealTitle = document.getElementById("mealTitle");
const mealMeta = document.getElementById("mealMeta");
const mealThumb = document.getElementById("mealThumb");
const ingredientsEl = document.getElementById("ingredients");
const instructionsEl = document.getElementById("instructions");
const linksEl = document.getElementById("links");

function setTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
	localStorage.setItem("nomnom-theme", theme);
	themeToggle.checked = theme === "dark";
}

function loadTheme() {
	const saved = localStorage.getItem("nomnom-theme");
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	setTheme(saved || (prefersDark ? "dark" : "light"));
}

function showError(message = "") {
	errorEl.textContent = message;
}

function renderCount(count) {
	resultCount.textContent = count ? `${count} meal${count === 1 ? "" : "s"}` : "—";
}

function buildIngredients(meal) {
	const list = [];
	for (let i = 1; i <= 20; i += 1) {
		const name = meal[`strIngredient${i}`];
		const measure = meal[`strMeasure${i}`];
		if (name && name.trim()) {
			list.push(`${name} ${measure ? `- ${measure.trim()}` : ""}`.trim());
		}
	}
	return list;
}

function renderDetail(meal) {
	if (!meal) {
		mealTitle.textContent = "Pick a meal";
		mealMeta.textContent = "Category • Area • Tags";
		mealThumb.src = "";
		mealThumb.alt = "";
		ingredientsEl.innerHTML = "";
		instructionsEl.textContent = "";
		linksEl.innerHTML = "";
		return;
	}

	mealTitle.textContent = meal.strMeal;
	mealMeta.textContent = `${meal.strCategory || "Category"} • ${meal.strArea || "Area"} • ${meal.strTags || "Tags"}`;
	mealThumb.src = meal.strMealThumb;
	mealThumb.alt = meal.strMeal;

	ingredientsEl.innerHTML = "";
	buildIngredients(meal).forEach((item) => {
		const li = document.createElement("li");
		li.textContent = item;
		ingredientsEl.appendChild(li);
	});

	instructionsEl.textContent = meal.strInstructions || "No instructions provided.";

	linksEl.innerHTML = "";
	if (meal.strYoutube) {
		const a = document.createElement("a");
		a.href = meal.strYoutube;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.className = "chip";
		a.textContent = "Watch on YouTube";
		linksEl.appendChild(a);
	}
	if (meal.strSource) {
		const a = document.createElement("a");
		a.href = meal.strSource;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.className = "chip";
		a.textContent = "Source";
		linksEl.appendChild(a);
	}
}

function renderResults(meals = [], heading = "Popular picks") {
	resultsGrid.innerHTML = "";
	resultsTitle.textContent = heading;
	renderCount(meals.length);

	if (!meals.length) {
		const empty = document.createElement("p");
		empty.className = "subtext";
		empty.textContent = "No meals found.";
		resultsGrid.appendChild(empty);
		return;
	}

	meals.forEach((meal) => {
		const card = document.createElement("article");
		card.className = "meal-card glass";
		card.innerHTML = `
			<img class="meal-thumb" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
			<div class="meal-body">
				<p class="meal-title">${meal.strMeal}</p>
				<p class="meal-meta">${meal.strCategory || ""} • ${meal.strArea || ""}</p>
			</div>
		`;
		card.addEventListener("click", () => fetchById(meal.idMeal));
		resultsGrid.appendChild(card);
	});
}

async function fetchSearch(query) {
	const trimmed = query.trim();
	if (!trimmed) {
		showError("Type a meal name or ingredient.");
		return;
	}
	showError("");
	resultsTitle.textContent = "Searching...";
	resultsGrid.innerHTML = "";

	try {
		const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(trimmed)}`);
		if (!res.ok) throw new Error("Search failed.");
		const data = await res.json();
		if (!data.meals) {
			renderResults([], `No results for "${trimmed}"`);
			renderDetail(null);
			return;
		}
		renderResults(data.meals, `Results for "${trimmed}"`);
		renderDetail(data.meals[0]);
	} catch (err) {
		console.error(err);
		showError(err.message || "Something went wrong.");
	}
}

async function fetchRandom() {
	showError("");
	resultsTitle.textContent = "Random pick";
	try {
		const res = await fetch(`${API_BASE}/random.php`);
		if (!res.ok) throw new Error("Could not get random meal.");
		const data = await res.json();
		if (!data.meals) throw new Error("Random meal unavailable.");
		renderResults(data.meals, "Random pick");
		renderDetail(data.meals[0]);
	} catch (err) {
		console.error(err);
		showError(err.message || "Something went wrong.");
	}
}

async function fetchById(id) {
	if (!id) return;
	showError("");
	try {
		const res = await fetch(`${API_BASE}/lookup.php?i=${id}`);
		if (!res.ok) throw new Error("Could not load meal.");
		const data = await res.json();
		if (!data.meals) throw new Error("Meal not found.");
		renderDetail(data.meals[0]);
	} catch (err) {
		console.error(err);
		showError(err.message || "Something went wrong.");
	}
}

function init() {
	loadTheme();
	themeToggle.addEventListener("change", (e) => setTheme(e.target.checked ? "dark" : "light"));

	searchBtn.addEventListener("click", () => fetchSearch(searchInput.value));
	randomBtn.addEventListener("click", fetchRandom);
	searchInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") fetchSearch(searchInput.value);
	});

	// Seed with a popular query to show results immediately
	searchInput.value = "chicken";
	fetchSearch(searchInput.value);
}

document.addEventListener("DOMContentLoaded", init);
