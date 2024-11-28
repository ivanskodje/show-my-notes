export default class InternalServerError extends Error {
  constructor(options?: ErrorOptions) {
    super("Internal Server Error", options);
  }
}
