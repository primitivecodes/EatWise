
    document.addEventListener('DOMContentLoaded', function() {
        const foodInput = document.getElementById('foodInput');
        const searchBtn = document.getElementById('searchBtn');
        const goalSelect = document.getElementById('goalSelect');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        const error = document.getElementById('error');

        const foodName = document.getElementById('foodName');
        const caloriesBadge = document.getElementById('caloriesBadge');
        const recommendationBadge = document.getElementById('recommendationBadge');
        const proteinProgress = document.getElementById('proteinProgress');
        const proteinValue = document.getElementById('proteinValue');
        const carbsProgress = document.getElementById('carbsProgress');
        const carbsValue = document.getElementById('carbsValue');
        const fatsProgress = document.getElementById('fatsProgress');
        const fatsValue = document.getElementById('fatsValue');

        searchBtn.addEventListener('click', searchFood);
        foodInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchFood();
        });

        async function searchFood() {
            const query = foodInput.value.trim();
            if (!query) return showError("Please enter a food item");
            showLoading();
            try {
                const data = await fetchNutritionData(query);
                displayNutritionData(data);
                showResults();
            } catch (err) {
                showError("Failed to fetch nutrition data. Try a different food item.");
            } finally {
                hideLoading();
            }
        }

        async function fetchNutritionData(query) {
            const response = await fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-app-id': 'de8a1f7a',
                    'x-app-key': 'aeb20bf2dbaf199ee444d98e594f67a1'
                },
                body: JSON.stringify({ query })
            });
            if (!response.ok) throw new Error("API error");
            const result = await response.json();
            return result.foods[0];
        }

        function displayNutritionData(data) {
            foodName.textContent = data.food_name;
            caloriesBadge.textContent = `${Math.round(data.nf_calories)} kcal`;

            const totalMacros = data.nf_protein + data.nf_total_carbohydrate + data.nf_total_fat;
            const proteinPercent = totalMacros > 0 ? Math.round((data.nf_protein / totalMacros) * 100) : 0;
            const carbsPercent = totalMacros > 0 ? Math.round((data.nf_total_carbohydrate / totalMacros) * 100) : 0;
            const fatsPercent = totalMacros > 0 ? Math.round((data.nf_total_fat / totalMacros) * 100) : 0;

            proteinValue.textContent = `${data.nf_protein.toFixed(1)}g`;
            carbsValue.textContent = `${data.nf_total_carbohydrate.toFixed(1)}g`;
            fatsValue.textContent = `${data.nf_total_fat.toFixed(1)}g`;

            createProgressCircle(proteinProgress, proteinPercent, 'var(--protein-color)');
            createProgressCircle(carbsProgress, carbsPercent, 'var(--carbs-color)');
            createProgressCircle(fatsProgress, fatsPercent, 'var(--fats-color)');

            applySmartRecommendation(data);
        }

        function applySmartRecommendation(data) {
            const goal = goalSelect.value;
            let recommended = false;

            if (goal === 'muscle_gain') {
                recommended = data.nf_protein >= 15;
            } else if (goal === 'weight_loss') {
                recommended = data.nf_calories <= 150 && data.nf_total_fat <= 5;
            } else {
                recommended = true;
            }

            recommendationBadge.innerHTML = recommended
                ? '<span class="badge recommended">✅ Recommended</span>'
                : '<span class="badge avoid">⚠️ Avoid</span>';
        }

        function createProgressCircle(element, percent, color) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (percent / 100) * circumference;
            element.innerHTML = `
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" stroke-width="10"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="10" 
                            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
                    <text x="50" y="50" text-anchor="middle" dy=".3em" font-size="20" fill="${color}">${percent}%</text>
                </svg>
            `;
        }

        function showLoading() {
            loading.classList.remove('hidden');
            results.classList.add('hidden');
            error.classList.add('hidden');
        }

        function hideLoading() {
            loading.classList.add('hidden');
        }

        function showResults() {
            results.classList.remove('hidden');
        }

        function showError(msg) {
            error.textContent = msg;
            error.classList.remove('hidden');
            results.classList.add('hidden');
            loading.classList.add('hidden');
        }
    });
    
