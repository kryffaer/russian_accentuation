class DictionaryLoader {
    static async load() {
        console.log('Загрузка словаря...');
        
        try {
            const response = await fetch('data/wordforms.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Словарь загружен: ${Object.keys(data.wordforms).length} словоформ`);
            
            return {
                wordforms: data.wordforms,
                lemmas: data.lemmas || {}
            };
            
        } catch (error) {
            console.error('Ошибка загрузки словаря:', error);
            throw error;
        }
    }
}