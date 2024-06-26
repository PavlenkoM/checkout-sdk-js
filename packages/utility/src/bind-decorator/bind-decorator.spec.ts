// eslint-disable-next-line max-classes-per-file
import bind from './bind-decorator';

describe('bindDecorator()', () => {
    @bind
    class Foo {
        constructor(private name: string) {}

        getName(): string {
            return this.name;
        }
    }

    class Bar {
        constructor(private name: string) {}

        @bind
        getName(): string {
            return this.name;
        }
    }

    it('binds all methods of class to instance', () => {
        const { getName } = new Foo('foo');

        expect(getName()).toBe('foo');
    });

    it('binds method to instance', () => {
        const { getName } = new Bar('bar');

        expect(getName()).toBe('bar');
    });
});
