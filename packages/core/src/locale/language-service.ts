import { FormatError, IntlMessageFormat } from 'intl-messageformat';
import { isObject, union } from 'lodash';
import MessageFormat from 'messageformat';

import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { Logger } from '../common/log';

import LanguageConfig, {
    Locales,
    TransformedLanguageConfig,
    TransformedTranslations,
    Translations,
} from './language-config';

const DEFAULT_LOCALE = 'en';
const KEY_PREFIX = 'optimized_checkout';

/**
 * Responsible for getting language strings.
 *
 * This object can be used to retrieve language strings that are most
 * appropriate for a given locale.
 *
 * The language strings provided to the object should follow [ICU
 * MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.
 */
@bind
export default class LanguageService {
    private _locale: string;
    private _locales: Locales;
    private _translations: TransformedTranslations;
    private _formatters: { [key: string]: any };
    private _isCspNonceExperimentEnabled: boolean;

    /**
     * @internal
     */
    constructor(config: Partial<LanguageConfig>, private _logger: Logger) {
        const { locale, locales, translations } = this._transformConfig(config);

        this._locale = locale;
        this._locales = locales;
        this._translations = translations;
        this._formatters = {};
        this._isCspNonceExperimentEnabled = config.isCspNonceExperimentEnabled ?? true;
    }

    /**
     * Remaps a set of language strings with a different set of keys.
     *
     * ```js
     * service.mapKeys({
     *     'new_key': 'existing_key',
     * });
     *
     * console.log(service.translate('new_key'));
     * ```
     *
     * @param maps - The set of language strings.
     */
    mapKeys(maps: { [key: string]: string }): void {
        Object.keys(maps).forEach((key) => {
            const translationKey = `${KEY_PREFIX}.${maps[key]}`;

            this._translations[`${KEY_PREFIX}.${key}`] = this._translations[translationKey];
        });
    }

    /**
     * Gets the preferred locale of the current customer.
     *
     * @returns The preferred locale code.
     */
    getLocale(): string {
        return this._hasTranslations() ? this._locale : DEFAULT_LOCALE;
    }

    /**
     * Gets a language string by a key.
     *
     * ```js
     * service.translate('language_key');
     * ```
     *
     * If the language string contains a placeholder, you can replace it by
     * providing a second argument.
     *
     * ```js
     * service.translate('language_key', { placeholder: 'Hello' });
     * ```
     *
     * @param key - The language key.
     * @param data - Data for replacing placeholders in the language string.
     * @returns The translated language string.
     */
    translate(key: string, data: TranslationData = {}): string {
        const prefixedKey = `${KEY_PREFIX}.${key}`;

        if (typeof this._translations[prefixedKey] !== 'string') {
            this._logger.warn(`Translation key "${prefixedKey}" is missing`);

            return prefixedKey;
        }

        if (this._isCspNonceExperimentEnabled) {
            if (!this._formatters[prefixedKey]) {
                this._formatters[prefixedKey] = new IntlMessageFormat(
                    this._escapeSpecialCharacters(this._translations[prefixedKey] || ''),
                    this._locales[prefixedKey],
                    undefined,
                    { ignoreTag: true },
                );
            }

            try {
                return this._formatters[prefixedKey].format(this._transformData(data));
            } catch (error) {
                if (this._isFormatError(error)) {
                    return error.originalMessage ?? '';
                }

                throw error;
            }
        }

        if (!this._formatters[prefixedKey]) {
            const messageFormat = new MessageFormat(this._locales[prefixedKey]);

            this._formatters[prefixedKey] = messageFormat.compile(
                this._translations[prefixedKey] || '',
            );
        }

        return this._formatters[prefixedKey](this._transformData(data));
    }

    private _transformConfig(config: Partial<LanguageConfig> = {}): TransformedLanguageConfig {
        const output: TransformedLanguageConfig = {
            defaultLocale: '',
            defaultTranslations: {},
            translations: {},
            locales: {},
            locale: config.locale || DEFAULT_LOCALE,
        };

        const locales = config.locales || {};
        const translations = this._flattenObject(config.translations || {});
        const defaultTranslations = this._flattenObject(config.defaultTranslations || {});
        const fallbackTranslations = this._flattenObject(config.fallbackTranslations || {});
        const translationKeys = union(
            Object.keys(fallbackTranslations),
            Object.keys(defaultTranslations),
            Object.keys(translations),
        );

        translationKeys.forEach((key) => {
            if (translations && translations[key]) {
                output.translations[key] = translations[key];
                output.locales[key] = locales[key] || output.locale;
            } else if (defaultTranslations[key]) {
                output.translations[key] = defaultTranslations[key];
                output.locales[key] = config.defaultLocale ?? DEFAULT_LOCALE;
            } else {
                output.translations[key] = fallbackTranslations[key];
                output.locales[key] = config.fallbackLocale ?? DEFAULT_LOCALE;
            }
        });

        return output;
    }

    private _flattenObject(
        object: Translations,
        result: TransformedTranslations = {},
        parentKey = '',
    ): TransformedTranslations {
        try {
            Object.keys(object).forEach((key) => {
                const value = object[key];
                const resultKey = parentKey ? `${parentKey}.${key}` : key;

                if (isObject(value)) {
                    return this._flattenObject(value, result, resultKey);
                }

                result[resultKey] = value;
            });
        } catch (err) {
            this._logger.warn(`Unable to parse object: ${err}`);
        }

        return result;
    }

    private _transformData(data: TranslationData): TranslationData {
        return Object.keys(data).reduce((result, key) => {
            const value = data[key];

            result[key] = value === null || value === undefined ? '' : value;

            return result;
        }, {} as TranslationData);
    }

    private _hasTranslations(): boolean {
        return (
            Object.keys(this._locales)
                .map((key) => this._locales[key])
                .filter((code) => code.split('-')[0] === this._locale.split('-')[0]).length > 0
        );
    }

    private _isFormatError(error: unknown): error is FormatError {
        return typeof error === 'object' && error !== null && 'originalMessage' in error;
    }

    private _escapeSpecialCharacters(message: string) {
        return message.replace(/(\w+)='([^']*)'/g, "$1=''$2''");
    }
}

export interface TranslationData {
    [key: string]: string | number;
}
