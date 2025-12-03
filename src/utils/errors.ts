/**
 * Base error class for all xtract errors
 */
export class XtractError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "XtractError";
    Object.setPrototypeOf(this, XtractError.prototype);
  }
}

/**
 * Thrown when a post cannot be found or accessed
 */
export class PostNotFoundError extends XtractError {
  constructor(
    public readonly postId: string,
    message?: string,
    cause?: Error,
  ) {
    super(message || `Post with ID ${postId} not found`, cause);
    this.name = "PostNotFoundError";
    Object.setPrototypeOf(this, PostNotFoundError.prototype);
  }
}

/**
 * Thrown when authentication with the API fails
 */
export class AuthenticationError extends XtractError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Thrown when parsing post data fails
 */
export class ParseError extends XtractError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "ParseError";
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

/**
 * Thrown when an invalid post ID or URL is provided
 */
export class InvalidPostIdError extends XtractError {
  constructor(
    public readonly input: string,
    message?: string,
  ) {
    super(message || `Invalid post ID or URL: ${input}`);
    this.name = "InvalidPostIdError";
    Object.setPrototypeOf(this, InvalidPostIdError.prototype);
  }
}
