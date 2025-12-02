

import type { Exercise, Lang } from './types';
import { ex1 } from './ex1-init-add-print';
import { ex2_for_MtoN } from './ex2_for_MtoN'
import { ex3_while_MtoN } from './ex3_while_MtoN';
import { ex4_if_positive_negative }  from "./ex4-if-positive-negative";
import { ex5_sum_MtoN }  from "./ex5_sum_MtoN";
import { ex6_count_evens_MtoN } from "./ex6-count-evens-MtoN"

export const EXERCISES: Exercise[] = [
    ex1,
    ex2_for_MtoN,
    ex3_while_MtoN,
    ex4_if_positive_negative,
    ex5_sum_MtoN,
    ex6_count_evens_MtoN,
];

export function listForLang(_lang: Lang): Exercise[] {

    return EXERCISES;
}

export function getById(id: string): Exercise | undefined {
    return EXERCISES.find(e => e.id === id);
}


