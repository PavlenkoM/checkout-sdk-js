import { merge } from 'lodash';

import { CartSelector, createCartSelectorFactory } from '../cart';
import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import ConsignmentSelector, {
    ConsignmentSelectorFactory,
    createConsignmentSelectorFactory,
} from './consignment-selector';
import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import { getShippingAddress } from './shipping-addresses.mock';

describe('ConsignmentSelector', () => {
    const emptyState: ConsignmentState = {
        statuses: {
            isUpdating: {},
            isUpdatingShippingOption: {},
            isDeleting: {},
        },
        errors: {
            updateError: {},
            updateShippingOptionError: {},
            deleteError: {},
        },
    };

    const existingAddress = getShippingAddress();
    const nonexistentAddress = { ...getShippingAddress(), address1: 'foo' };

    let selector: ConsignmentSelector;
    let state: CheckoutStoreState;
    let cartSelector: CartSelector;
    let createConsignmentSelector: ConsignmentSelectorFactory;

    beforeEach(() => {
        createConsignmentSelector = createConsignmentSelectorFactory();
        state = getCheckoutStoreState();
        cartSelector = createCartSelectorFactory()(state.cart);
    });

    describe('#getConsignmentByAddress()', () => {
        it('returns first matched consignment when address matches', () => {
            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignmentByAddress(existingAddress))
                // tslint:disable-next-line:no-non-null-assertion
                .toEqual(getConsignmentsState().data![0]);
        });

        it('returns undefined if no address matches a consignment', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignmentByAddress(nonexistentAddress)).toBeUndefined();
        });
    });

    describe('#getConsignmentById()', () => {
        it('returns consignment that matches id', () => {
            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignmentById('55c96cda6f04c'))
                // tslint:disable-next-line:no-non-null-assertion
                .toEqual(getConsignmentsState().data![0]);
        });

        it('returns undefined if no id matches a consignment', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignmentById('none')).toBeUndefined();
        });
    });

    describe('#getConsignments()', () => {
        it('returns consignments', () => {
            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignments()).toEqual(getConsignmentsState().data);
        });

        it('returns undefined if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignments()).toBeUndefined();
        });
    });

    describe('#getShippingOption()', () => {
        it('returns selected shipping option for default consignment', () => {
            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getShippingOption()).toEqual(getConsignment().selectedShippingOption);
        });

        it('returns undefined if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignments()).toBeUndefined();
        });
    });

    describe('#getLoadError()', () => {
        it('returns load error', () => {
            const loadError = new Error();

            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    errors: { loadError },
                }),
                cartSelector,
            );

            expect(selector.getLoadError()).toEqual(loadError);
        });

        it('returns undefined if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getCreateError()', () => {
        it('returns create error', () => {
            const createError = new Error();

            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    errors: { createError },
                }),
                cartSelector,
            );

            expect(selector.getCreateError()).toEqual(createError);
        });

        it('returns undefined if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getCreateError()).toBeUndefined();
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns shipping options load error', () => {
            const loadShippingOptionsError = new Error();

            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    errors: { loadShippingOptionsError },
                }),
                cartSelector,
            );

            expect(selector.getLoadShippingOptionsError()).toEqual(loadShippingOptionsError);
        });

        it('returns undefined if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.getLoadShippingOptionsError()).toBeUndefined();
        });
    });

    describe('#getUpdateShippingOptionError()', () => {
        it('returns undefined if none errored', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.getUpdateShippingOptionError()).toBeUndefined();
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        errors: {
                            updateShippingOptionError: {
                                foo: error,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns first encountered error', () => {
                expect(selector.getUpdateShippingOptionError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getUpdateShippingOptionError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getUpdateShippingOptionError('bar')).toBeUndefined();
            });
        });
    });

    describe('#getUpdateError()', () => {
        it('returns undefined if none errored', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.getUpdateError()).toBeUndefined();
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        errors: {
                            updateError: {
                                foo: error,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns first encountered error', () => {
                expect(selector.getUpdateError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getUpdateError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getUpdateError('bar')).toBeUndefined();
            });
        });
    });

    describe('#getDeleteError()', () => {
        it('returns undefined if none errored', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.getDeleteError()).toBeUndefined();
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        errors: {
                            deleteError: {
                                foo: error,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns first encountered error', () => {
                expect(selector.getDeleteError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getDeleteError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getDeleteError('bar')).toBeUndefined();
            });
        });
    });

    describe('#getItemAssignmentError()', () => {
        const updateError = new Error();
        const createError = new Error();

        beforeEach(() => {
            selector = createConsignmentSelector(
                merge(state.consignments, {
                    errors: {
                        updateError: {
                            '55c96cda6f04c': updateError,
                        },
                        createError,
                    },
                }),
                cartSelector,
            );
        });

        it('returns first encountered error for consignment with matching address', () => {
            expect(selector.getItemAssignmentError(existingAddress)).toEqual(updateError);
        });

        it('returns create error when address does not match any consignment', () => {
            expect(selector.getItemAssignmentError(nonexistentAddress)).toEqual(createError);
        });
    });

    describe('#getUnassignedItems()', () => {
        it('returns unassigned items', () => {
            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getUnassignedItems()).toEqual([
                // tslint:disable-next-line:no-non-null-assertion
                state.cart.data!.lineItems.physicalItems[0],
            ]);
        });

        it('returns empty array if all items are assigned', () => {
            jest.spyOn(cartSelector, 'getCart').mockReturnValue({
                ...state.cart,
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                lineItems: {
                    physicalItems: [
                        {
                            // tslint:disable-next-line:no-non-null-assertion
                            ...state.cart.data!.lineItems.physicalItems[0],
                            id: '12e11c8f-7dce-4da3-9413-b649533f8bad',
                        },
                    ],
                },
            });

            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getUnassignedItems()).toEqual([]);
        });

        it('returns empty array if there are no phyisical items', () => {
            jest.spyOn(cartSelector, 'getCart').mockReturnValue({
                ...state.cart,
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                lineItems: { physicalItems: null },
            });

            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getUnassignedItems()).toEqual([]);
        });

        it('returns empty array if there is no cart', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(cartSelector, 'getCart').mockReturnValue(null);

            selector = createConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getUnassignedItems()).toEqual([]);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading', () => {
            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    statuses: { isLoading: true },
                }),
                cartSelector,
            );

            expect(selector.isLoading()).toBe(true);
        });

        it('returns false if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.isLoading()).toBe(false);
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading', () => {
            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    statuses: { isLoadingShippingOptions: true },
                }),
                cartSelector,
            );

            expect(selector.isLoadingShippingOptions()).toBe(true);
        });

        it('returns false if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.isLoadingShippingOptions()).toBe(false);
        });
    });

    describe('#isCreating()', () => {
        it('returns true if creating', () => {
            selector = createConsignmentSelector(
                merge({}, emptyState, {
                    statuses: { isCreating: true },
                }),
                cartSelector,
            );

            expect(selector.isCreating()).toBe(true);
        });

        it('returns false if unavailable', () => {
            selector = createConsignmentSelector(emptyState, cartSelector);

            expect(selector.isCreating()).toBe(false);
        });
    });

    describe('#isUpdating()', () => {
        it('returns false if none is updating', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.isUpdating()).toBe(false);
        });

        describe('when only one consignment is being updated', () => {
            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        statuses: {
                            isUpdating: {
                                foo: true,
                                bar: false,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns true if updating any', () => {
                expect(selector.isUpdating()).toBe(true);
            });

            it('returns true if requested id is being updated', () => {
                expect(selector.isUpdating('foo')).toBe(true);
            });

            it('returns false if requested id is not being updated', () => {
                expect(selector.isUpdating('bar')).toBe(false);
            });
        });
    });

    describe('#isDeleting()', () => {
        it('returns false if none is deleting', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.isDeleting()).toBe(false);
        });

        describe('when only one consignment is being deleted', () => {
            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        statuses: {
                            isDeleting: {
                                foo: true,
                                bar: false,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns true if deleting any', () => {
                expect(selector.isDeleting()).toBe(true);
            });

            it('returns true if requested id is being deleted', () => {
                expect(selector.isDeleting('foo')).toBe(true);
            });

            it('returns false if requested id is not being deleted', () => {
                expect(selector.isDeleting('bar')).toBe(false);
            });
        });
    });

    describe('#isAssigningItems()', () => {
        beforeEach(() => {
            selector = createConsignmentSelector(
                merge(state.consignments, {
                    statuses: {
                        isUpdating: {
                            '55c96cda6f04c': true,
                        },
                        isCreating: false,
                    },
                }),
                cartSelector,
            );
        });

        it('returns isUpdating state for consignment that matches given address', () => {
            expect(selector.isAssigningItems(existingAddress)).toBe(true);
        });

        it('returns isCreating state when no consignment matches address', () => {
            expect(selector.isAssigningItems(nonexistentAddress)).toBe(false);
        });
    });

    describe('#isUpdatingShippingOption()', () => {
        it('returns false if none is updating', () => {
            selector = createConsignmentSelector(merge({}, emptyState), cartSelector);

            expect(selector.isUpdatingShippingOption()).toBe(false);
        });

        describe('when only one consignment is being updated', () => {
            beforeEach(() => {
                selector = createConsignmentSelector(
                    merge({}, emptyState, {
                        statuses: {
                            isUpdatingShippingOption: {
                                foo: true,
                                bar: false,
                            },
                        },
                    }),
                    cartSelector,
                );
            });

            it('returns true if updating any', () => {
                expect(selector.isUpdatingShippingOption()).toBe(true);
            });

            it('returns true if requested id is being updated', () => {
                expect(selector.isUpdatingShippingOption('foo')).toBe(true);
            });

            it('returns false if requested id is not being updated', () => {
                expect(selector.isUpdatingShippingOption('bar')).toBe(false);
            });
        });
    });
});
