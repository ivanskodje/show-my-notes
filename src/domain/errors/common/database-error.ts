export default class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
