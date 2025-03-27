import { emailRegex } from "./emailRegex";

import {test, describe, expect} from 'vitest'

describe('Email regex', async () => {
    test('normal email passes', async () => {
        const result = emailRegex.test('myemail@gmail.com')
        expect(result).toBe(true)
    })

    test('missing @ fails', async () => {
        const result = emailRegex.test('myemail.gmail.com')
        expect(result).toBe(false)
    })

    test('missing .com fails', async () => {
        const result = emailRegex.test('myemail@gmail')
        expect(result).toBe(false)
    })
})

/* 
pnpm vitest run src/library/utilities/public/definitions/emailRegex
*/