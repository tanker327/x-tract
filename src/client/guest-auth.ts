import { z } from "zod";
import {
  PUBLIC_BEARER_TOKEN,
  GUEST_ACTIVATE_URL,
  USER_AGENT,
} from "./constants";
import { AuthenticationError } from "../utils/errors";

/**
 * Schema for guest token response
 */
const GuestTokenSchema = z.object({
  guest_token: z.string(),
});

/**
 * Activates a guest session with the Twitter API
 *
 * @returns Guest token string
 * @throws {AuthenticationError} If guest activation fails
 */
export async function activateGuest(): Promise<string> {
  try {
    const response = await fetch(GUEST_ACTIVATE_URL, {
      headers: {
        Authorization: `Bearer ${PUBLIC_BEARER_TOKEN}`,
        "User-Agent": USER_AGENT,
      },
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AuthenticationError(
        `Failed to activate guest: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    const data = await response.json();
    const result = GuestTokenSchema.parse(data);
    return result.guest_token;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      "Failed to authenticate with Twitter API",
      error instanceof Error ? error : undefined,
    );
  }
}
