export class DataFrame {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: Record<string, any>[];

  constructor(data: Record<string, any[]>[]) {
    this.data = data;
  }
}
