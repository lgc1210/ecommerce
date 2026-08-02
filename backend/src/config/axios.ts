import axios from "axios";
import { env } from "./dotenv.js";

export const ghnClient = axios.create({
	headers: {
		"Content-Type": "application/json",
		Token: env.GHN_API_TOKEN,
	},
});
