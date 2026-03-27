class AccentCore {
    constructor(wordforms, lemmas) {
        this.wordforms = wordforms;  // Словарь словоформ с ударениями
        this.lemmas = lemmas || {};  // Словарь частей речи
    }

    // Проверяем, подходит ли интерпретация слова по части речи
    compatible(interpretation, lemma, tag, lemmas) {
        if (!lemma || !lemmas[lemma]) return true;
        
        const possiblePoses = lemmas[lemma].pos || [];
        if (possiblePoses.length === 0) return true;
        
        // Проверяем совпадение части речи
        let posExists = false;
        for (const possiblePos of possiblePoses) {
            if (tag && tag.includes(possiblePos)) {
                posExists = true;
                break;
            }
        }
        
        if (!posExists) return false;
        
        // Каноническая форма всегда подходит
        if (interpretation.form === "canonical") return true;
        
        return true;
    }
    
    // Проверяем, одинаковое ли ударение у всех интерпретаций
    deriveSingleAccentuation(interpretations) {
        if (!interpretations || interpretations.length === 0) return null;
        
        const firstAccent = interpretations[0].accentuated;
        for (let i = 1; i < interpretations.length; i++) {
            if (interpretations[i].accentuated !== firstAccent) return null;
        }
        return firstAccent;
    }
    
    // Расставляем ударение в одном слове
    accentuateWord(tokenInfo, lemmas) {
        const word = tokenInfo.token;
        const tag = tokenInfo.tag || '';
        
        // Если слова нет в словаре - возвращаем как есть
        if (!tokenInfo.interpretations || tokenInfo.interpretations.length === 0) {
            return word;
        }
        
        // Если у всех вариантов одинаковое ударение - сразу возвращаем
        const singleAccent = this.deriveSingleAccentuation(tokenInfo.interpretations);
        if (singleAccent !== null) return singleAccent;
        
        // Фильтруем подходящие по части речи интерпретации
        const compatibleInterpretations = [];
        for (const interp of tokenInfo.interpretations) {
            if (this.compatible(interp, tokenInfo.lemma, tag, lemmas)) {
                compatibleInterpretations.push(interp);
            }
        }
        
        // Проверяем, не стало ли после фильтрации ударение одинаковым
        const filteredAccent = this.deriveSingleAccentuation(compatibleInterpretations);
        if (filteredAccent !== null) return filteredAccent;
        
        // Если остались варианты - берём первый
        if (compatibleInterpretations.length > 0) {
            return compatibleInterpretations[0].accentuated;
        }
        
        return word;
    }
    
    // Расставляет ударения во всём тексте
    accentuate(text, tokenizer) {
        const tokens = tokenizer.tokenize(text);
        
        const accentuatedTokens = tokens.map(token => {
            // Пунктуацию и пробелы пропускаем
            if (token.isPunctuation || token.isSpace) {
                return { text: token.text, whitespace: token.whitespace };
            }
            
            let accented = this.accentuateWord(token, this.lemmas);
            
            // Восстанавливаем регистр (заглавные буквы)
            if (token.startsWithCapital && accented.length > 0) {
                accented = accented.charAt(0).toUpperCase() + accented.slice(1);
            }
            if (token.isUppercase) {
                accented = accented.toUpperCase();
            }
            
            return { text: accented, whitespace: token.whitespace };
        });
        
        // Собираем текст обратно
        let result = '';
        for (const token of accentuatedTokens) {
            result += token.text;
            if (token.whitespace) result += ' ';
        }
        
        return result.trim();
    }
}