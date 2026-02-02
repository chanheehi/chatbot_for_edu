import type { FilterResult } from '../types/index.js';
import profanityData from '../data/profanity.json' with { type: 'json' };
import stopwordsData from '../data/stopwords.json' with { type: 'json' };

export class ProfanityFilter {
  private profanityWords: Set<string>;
  private profanityPatterns: RegExp[];
  private stopwords: Set<string>;

  constructor() {
    this.profanityWords = new Set(
      profanityData.words.map((w) => w.toLowerCase())
    );
    this.profanityPatterns = profanityData.patterns.map(
      (p) => new RegExp(p, 'gi')
    );
    this.stopwords = new Set(stopwordsData.words.map((w) => w.toLowerCase()));
  }

  checkProfanity(text: string): FilterResult {
    const lowerText = text.toLowerCase();
    const matchedWords: string[] = [];

    // 직접 단어 매칭
    for (const word of this.profanityWords) {
      if (lowerText.includes(word)) {
        matchedWords.push(word);
      }
    }

    // 패턴 매칭 (우회 표현 탐지)
    for (const pattern of this.profanityPatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matchedWords.push(...matches);
      }
    }

    return {
      isClean: matchedWords.length === 0,
      matchedWords: matchedWords.length > 0 ? matchedWords : undefined,
    };
  }

  checkStopwords(text: string): FilterResult {
    const lowerText = text.toLowerCase();
    const matchedWords: string[] = [];

    for (const word of this.stopwords) {
      if (lowerText.includes(word)) {
        matchedWords.push(word);
      }
    }

    return {
      isClean: matchedWords.length === 0,
      matchedWords: matchedWords.length > 0 ? matchedWords : undefined,
    };
  }

  isClean(text: string): FilterResult {
    const profanityResult = this.checkProfanity(text);
    if (!profanityResult.isClean) {
      return profanityResult;
    }

    const stopwordsResult = this.checkStopwords(text);
    return stopwordsResult;
  }
}
