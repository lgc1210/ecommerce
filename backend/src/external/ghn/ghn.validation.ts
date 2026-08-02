import { z } from "zod";

export const DistrictSchema = z.object({
	query: z.object({
		provinceId: z.coerce.number({ message: "provinceId phải là một số" }),
	}),
});

export const WardSchema = z.object({
	query: z.object({
		districtId: z.coerce.number({ message: "districtId phải là một số" }),
	}),
});
