export function wait(ms = 10) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
