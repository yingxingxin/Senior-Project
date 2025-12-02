

import type { Exercise, Lang } from './types';
import { ex01_add_two_numbers } from './ex01_add_two_numbers';
import { ex02_max_of_two } from './ex02_max_of_two'
import { ex03_sum_MtoN } from './ex03_sum_MtoN';
import { ex04_count_evens_MtoN }  from "./ex04_count_evens_MtoN";
import { ex05_multiplication_table }  from "./ex05_multiplication_table";
import { ex06_factorial } from "./ex06_factorial"
import { ex07_sum_squares_MtoN} from "./ex07_sum_squares_MtoN"
import { ex08_power_A_to_B } from "./ex08_power_A_to_B"
import { ex09_multiples_of_K }  from "./ex09_multiples_of_k"
import { ex10_sum_of_digits } from "./ex10_sum_of_digits"
import {ex11_reverse_number} from "./ex11_reverse_number";
import {ex12_max_in_list} from "./ex12_max_in_list";
import {ex13_min_in_list} from "./ex13_min_in_list";
import {ex14_average_of_list} from "./ex14_average_of_list";
import {ex15_count_occurrences} from "./ex15_count_occurences";
import {ex16_string_length} from "./ex16_string_length";
import {ex17_if_positive_negative} from "./ex17_if_positive_negative";

export const EXERCISES: Exercise[] = [
    ex01_add_two_numbers,
    ex02_max_of_two,
    ex03_sum_MtoN,
    ex04_count_evens_MtoN,
    ex05_multiplication_table,
    ex06_factorial,
    ex07_sum_squares_MtoN,
    ex08_power_A_to_B,
    ex09_multiples_of_K,
    ex10_sum_of_digits,
    ex11_reverse_number,
    ex12_max_in_list,
    ex13_min_in_list,
    ex14_average_of_list,
    ex15_count_occurrences,
    ex16_string_length,
    ex17_if_positive_negative,

];

export function listForLang(_lang: Lang): Exercise[] {

    return EXERCISES;
}

export function getById(id: string): Exercise | undefined {
    return EXERCISES.find(e => e.id === id);
}


