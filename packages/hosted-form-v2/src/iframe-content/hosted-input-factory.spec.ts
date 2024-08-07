import HostedFieldType from '../hosted-field-type';

import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';

describe('HostedInputFactory', () => {
    let factory: HostedInputFactory;

    beforeEach(() => {
        factory = new HostedInputFactory(
            'https://store.foobar.com',
            'https://bigpay.service.bcdev',
        );
    });

    it('creates card number field', () => {
        expect(
            factory.create(document.createElement('form'), HostedFieldType.CardNumber),
        ).toBeInstanceOf(HostedCardNumberInput);
    });

    it('creates card expiry field', () => {
        expect(
            factory.create(document.createElement('form'), HostedFieldType.CardExpiry),
        ).toBeInstanceOf(HostedCardExpiryInput);
    });

    it('creates regular input field for other field types', () => {
        expect(
            factory.create(document.createElement('form'), HostedFieldType.CardCode),
        ).toBeInstanceOf(HostedInput);

        expect(
            factory.create(document.createElement('form'), HostedFieldType.CardName),
        ).toBeInstanceOf(HostedInput);
    });

    it('normalises parent origin if origin contains www', () => {
        factory.normalizeParentOrigin('https://www.store.foobar.com');

        expect(factory.getParentOrigin()).toBe('https://www.store.foobar.com');
    });

    it('does not normalise parent origin if origin is completely different', () => {
        factory.normalizeParentOrigin('https://www.xyz.com');

        expect(factory.getParentOrigin()).toBe('https://store.foobar.com');
    });
});
