export default class InvalidInputError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
