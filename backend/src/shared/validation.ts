import z from "zod";

export const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });

export const vietnamesePhoneRegex = /^(0|\+84)[0-9]{9,10}$/;

export const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
