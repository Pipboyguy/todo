/**
 * Core data types for the Todo application
 */

export interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: Date;
	translations?: Record<string, string>;
}

export interface TranslationCache {
	[key: string]: {
		translation: string;
		timestamp: number;
	};
}

export interface AppState {
	todos: Todo[];
	selectedLanguage: string;
}

export const SUPPORTED_LANGUAGES = {
	af: 'Afrikaans',
	sq: 'Albanian',
	am: 'Amharic',
	ar: 'Arabic',
	hy: 'Armenian',
	az: 'Azerbaijani',
	eu: 'Basque',
	bn: 'Bengali',
	bs: 'Bosnian',
	bg: 'Bulgarian',
	ca: 'Catalan',
	'zh-CN': 'Chinese (Simplified)',
	'zh-TW': 'Chinese (Traditional)',
	hr: 'Croatian',
	cs: 'Czech',
	da: 'Danish',
	nl: 'Dutch',
	en: 'English',
	et: 'Estonian',
	fi: 'Finnish',
	fr: 'French',
	de: 'German',
	el: 'Greek',
	he: 'Hebrew',
	hi: 'Hindi',
	hu: 'Hungarian',
	is: 'Icelandic',
	id: 'Indonesian',
	ga: 'Irish',
	it: 'Italian',
	ja: 'Japanese',
	ko: 'Korean',
	lv: 'Latvian',
	lt: 'Lithuanian',
	mk: 'Macedonian',
	ms: 'Malay',
	mt: 'Maltese',
	no: 'Norwegian',
	fa: 'Persian',
	pl: 'Polish',
	pt: 'Portuguese',
	ro: 'Romanian',
	ru: 'Russian',
	sr: 'Serbian',
	sk: 'Slovak',
	sl: 'Slovenian',
	es: 'Spanish',
	sw: 'Swahili',
	sv: 'Swedish',
	ta: 'Tamil',
	th: 'Thai',
	tr: 'Turkish',
	uk: 'Ukrainian',
	vi: 'Vietnamese',
	cy: 'Welsh'
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds