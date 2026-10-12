declare module 'sharp-phash' {
  function phash(input: Buffer | string): Promise<string>;
  export default phash;
}
