import { describe, it, expect } from "vitest";
import {vec4, vec4Add, vec4Divide, vec4Dot, vec4Magnitude, vec4Normalize, vec4Scale, vec4Sub} from "../src/gl/vec4";

describe('vec4', () => {
    it('adds vectors', () => {
        const a = vec4(1, 2, 3, 4);
        const b = vec4(5, 6, 7, 8);
        const expected = vec4(6, 8, 10, 12);
        const actual = vec4Add(vec4(), a, b);
        expect(actual).toEqual(expected);
    })

    it('subtracts vectors', () => {
        const a = vec4(1, 2, 3, 4);
        const b = vec4(5, 6, 7, 8);
        const expected = vec4(-4, -4, -4, -4);
        const actual = vec4Sub(vec4(), a, b);
        expect(actual).toEqual(expected);
    });

    it('scales vectors', () => {
        const a = vec4(1, 2, 3, 4);
        const expected = vec4(2, 4, 6, 8);
        const actual = vec4Scale(vec4(), a, 2);
        expect(actual).toEqual(expected);
    });

    it('divides vectors', () => {
        const a = vec4(2, 4, 6, 8);
        const expected = vec4(1, 2, 3, 4);
        const actual = vec4Divide(vec4(), a, 2);
        expect(actual).toEqual(expected);
    });

    it('calculates dot product', () => {
        const a = vec4(1, 2, 3, 4);
        const b = vec4(5, 6, 7, 8);
        const expected = 70;
        const actual = vec4Dot(a, b);
        expect(actual).toEqual(expected);
    });

    it('calculates magnitude', () => {
        const a = vec4(1, 2, 3, 4);
        const expected = 5.477225575051661;
        const actual = vec4Magnitude(a);
        expect(actual).toEqual(expected);
    });

    it('normalizes vectors', () => {
        const a = vec4(1, 2, 3, 4);
        const expected = vec4(0.18257418583505536, 0.3651483716701107, 0.5477225575051661, 0.7302967433402214);
        const actual = vec4Normalize(vec4(), a);
        expect(actual).toEqual(expected);
    });
});