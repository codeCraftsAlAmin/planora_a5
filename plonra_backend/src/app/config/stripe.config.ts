import Stripe from "stripe";
import { envVars } from "./env";

const stripe = new Stripe(envVars.STRIPE_SEC_KEY);

export default stripe;
