import { findIndex, pick, pickBy, ValueKeyIteratee } from 'lodash';

import isPlainObject from './is-plain-object';
import objectMerge from './object-merge';

/**
 * Push an item to an array if it doesn't exist in the array. Otherwise, merge
 * with the existing item in the array. This function always returns a new array.
 */
export default function mergeOrPush<T>(array: T[], item?: T, predicate?: ValueKeyIteratee<T>): T[] {
    if (!item) {
        return array;
    }

    const defaultPredicate = pick<T>(item, 'id');
    const derivedPredicate: any =
        typeof predicate === 'object' ? pickBy<T>(predicate) : predicate || defaultPredicate;
    const index = findIndex(array, derivedPredicate);
    const newArray = [...array];

    if (index === -1) {
        newArray.push(item);
    } else {
        const existingItem = array[index];

        newArray[index] =
            isPlainObject(existingItem) && isPlainObject(item)
                ? objectMerge(existingItem, item)
                : item;
    }

    return newArray;
}
