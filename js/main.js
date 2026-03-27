let accentCore = null;      // Экземпляр класса для расстановки ударений
let tokenizer = null;       // Экземпляр токенизатора (разбивает текст на слова)
let isDictionaryLoaded = false;  // Флаг загрузки словаря

const inputText = document.getElementById('input-text');    
const outputText = document.getElementById('output-text');   
const accentBtn = document.getElementById('accent-btn');     
const clearBtn = document.getElementById('clear-btn');       
const copyBtn = document.getElementById('copy-btn');          
const loadingDiv = document.getElementById('loading');     
const statsDiv = document.getElementById('stats');            

const exampleText = `В густой чащобе, где солнце едва пробивалось сквозь кроны столетних дубов, жила старуха-травница. Её избушка, покосившаяся от времени, тонула в зарослях мяты и зверобоя.`;

// Загружаем словарь и создаём объекты для работы
async function init() {
    showLoading(true);  
    
    try {
        const dictionary = await DictionaryLoader.load();
        
        tokenizer = new Tokenizer(dictionary.wordforms);
        accentCore = new AccentCore(dictionary.wordforms, dictionary.lemmas);
        
        isDictionaryLoaded = true;
        showLoading(false);
        
        inputText.value = exampleText;
        
        showStats(`Словарь загружен: ${Object.keys(dictionary.wordforms).length} словоформ`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showLoading(false);
        outputText.innerHTML = '<span style="color: red;">Ошибка загрузки словаря. Пожалуйста, обновите страницу.</span>';
    }
}

// Расстановка ударений
function processText() {
    // Проверяем, загружен ли словарь
    if (!isDictionaryLoaded) {
        alert('Словарь ещё загружается. Пожалуйста, подождите.');
        return;
    }
    
    const text = inputText.value;
    if (!text.trim()) {
        outputText.innerHTML = '<span style="color: #999;">Введите текст для обработки</span>';
        return;
    }
    
    // Измеряем время выполнения
    const startTime = performance.now();
    
    // Расставляем ударения
    const result = accentCore.accentuate(text, tokenizer);
    
    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);
    
    // Выделяем ударения красным цветом
    const highlightedResult = highlightAccents(result);
    outputText.innerHTML = highlightedResult;
    
    // Показываем статистику
    showStats(`Обработано: ${text.length} символов | Время: ${processingTime} мс`);
}

// Выделяем ударные гласные красным цветом
function highlightAccents(text) {
    return text.replace(/([а-яё])\u0301/gi, '<span class="accent">$1\u0301</span>');
}

// Очищаем поля ввода и вывода
function clearFields() {
    inputText.value = '';
    outputText.innerHTML = '<span style="color: #999;">Результат появится здесь</span>';
    statsDiv.classList.add('hidden');
}

// Копируем результат в буфер обмена
async function copyResult() {
    const resultText = outputText.innerText;
    if (!resultText || resultText === 'Результат появится здесь') {
        alert('Нет результата для копирования');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(resultText);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать текст');
    }
}

// Показываем/скрываем индикатор загрузки
function showLoading(show) {
    if (show) {
        loadingDiv.classList.remove('hidden');
        accentBtn.disabled = true;   
    } else {
        loadingDiv.classList.add('hidden');
        accentBtn.disabled = false;  
    }
}

// Показываем сообщение в блоке статистики на 5 секунд
function showStats(message) {
    statsDiv.innerHTML = message;
    statsDiv.classList.remove('hidden');
    setTimeout(() => {
        statsDiv.classList.add('hidden');
    }, 5000);
}

accentBtn.addEventListener('click', processText); // Расставить ударения
clearBtn.addEventListener('click', clearFields); // Очистить
copyBtn.addEventListener('click', copyResult); // Копировать

// Горячая клавиша Ctrl+Enter 
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        processText();
    }
});

init();