class Tokenizer {
    constructor(wordforms) {
        this.wordforms = wordforms; 
    }

    tokenize(text) {
        const tokens = [];
        let currentToken = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Если встретили разделитель (знак, пробел, перенос)
            if (this.isPunctuation(char) || char === ' ' || char === '\n' || char === '\t') {
                // Сохраняем накопленное слово
                if (currentToken) {
                    tokens.push(this.createToken(currentToken));
                    currentToken = '';
                }
                
                // Сохраняем сам разделитель
                tokens.push({
                    text: char,
                    isPunctuation: this.isPunctuation(char),
                    isSpace: (char === ' ' || char === '\n' || char === '\t'),
                    whitespace: (char === ' ' || char === '\n' || char === '\t')
                });
            } else {
                // Накопливаем буквы в слово
                currentToken += char;
            }
        }
        
        // Сохраняем последнее слово
        if (currentToken) {
            tokens.push(this.createToken(currentToken));
        }
        
        // Объединяем слова с дефисами 
        return this.mergeHyphenatedTokens(tokens);
    }
    
    // Создаём токен слова с информацией из словаря
    createToken(word) {
        const lowerWord = word.toLowerCase();
        
        const token = {
            text: word,                    
            token: word,                 
            tag: this.guessTag(word),     
            lemma: lowerWord,        
            startsWithCapital: word.length > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase(), // С заглавной?
            isUppercase: word === word.toUpperCase() && word.length > 0, 
            isPunctuation: false,
            isSpace: false,
            whitespace: false
        };
        
        // Ищем слово в словаре (сначала в нижнем регистре, потом как есть)
        if (this.wordforms && this.wordforms[lowerWord]) {
            token.interpretations = this.wordforms[lowerWord];  
        } else if (this.wordforms && this.wordforms[word]) {
            token.interpretations = this.wordforms[word];
        }
        
        return token;
    }
    
    // Определяем часть речи по окончанию слова 
    guessTag(word) {
        const suffixes = {
            'NOUN': ['ость', 'ение', 'ание', 'ция', 'ия', 'а', 'я', 'ь'],  
            'ADJF': ['ый', 'ий', 'ой', 'ая', 'ее', 'ие'],                   
            'VERB': ['ть', 'ти', 'чь', 'тся', 'ться']                       
        };
        
        const lower = word.toLowerCase();
        
        for (const [pos, suffList] of Object.entries(suffixes)) {
            for (const suff of suffList) {
                if (lower.endsWith(suff)) return pos;
            }
        }
        
        return 'NOUN';  
    }
    
    // Проверяем, является ли символ знаком препинания
    isPunctuation(char) {
        const punct = '.,!?;:()[]{}"\'–—…«»';
        return punct.includes(char);
    }
    
    // Объединяем слова с дефисом в один токен
    mergeHyphenatedTokens(tokens) {
        const merged = [];
        let i = 0;
        
        while (i < tokens.length) {
            const token = tokens[i];
            
            if (!token.isPunctuation && !token.isSpace && i + 2 < tokens.length) {
                const next = tokens[i + 1];      
                const nextNext = tokens[i + 2];  
                
                if (next && next.text === '-' && nextNext && !nextNext.isPunctuation && !nextNext.isSpace) {
                    const compoundWord = token.text + '-' + nextNext.text;
                    const mergedToken = this.createToken(compoundWord);
                    merged.push(mergedToken);
                    i += 3;  
                    continue;
                }
            }
            
            merged.push(token);
            i++;
        }
        
        return merged;
    }
}