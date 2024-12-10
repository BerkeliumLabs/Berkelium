export class DataFrame {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: Record<string, any>[];

  /**
   * Initializes a new instance of the DataFrame class with the provided data.
   *
   * @param {Record<string, any[]>[]} data - An array of records where each record
   * contains a string key and an array of any type values, representing the data
   * to be stored in the DataFrame.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: Record<string, any[]>[]) {
    this.data = data;
  }

  /**
   * Gets the column names of the DataFrame.
   *
   * @returns {string[]} - An array of strings containing the column names of the DataFrame.
   */
  get columns(): string[] {
    return this.data.length > 0 ? Object.keys(this.data[0]) : [];
  }

  /**
   * Gets the index labels of the DataFrame.
   *
   * @returns {number[]} - An array of numbers representing the index labels of the DataFrame.
   * Each index represents the position of the row in the data.
   */
  get index(): number[] {
    return Array.from({ length: this.data.length }, (_, i) => i);
  }

  /**
   * Gets the shape of the DataFrame as a tuple of two numbers.
   * The first number represents the number of rows and the second number
   * represents the number of columns.
   *
   * @returns {[number, number]} - A tuple of two numbers representing the shape of the DataFrame.
   */
  get shape(): [number, number] {
    return [this.data.length, this.columns.length];
  }

  /**
   * Gets the data types of each column in the DataFrame.
   *
   * @returns {Record<string, DataType>} - An object mapping each column name to its data type.
   * If the DataFrame is empty, returns an empty object.
   */
  get dTypes(): Record<string, DataType> {
    if (this.data.length === 0) return {};

    return this.columns.reduce((acc, col) => {
      acc[col] = typeof this.data[0][col] as DataType;
      return acc;
    }, {} as Record<string, DataType>);
  }

  /**
   * Gets the first n rows of the DataFrame.
   *
   * @param {number} [n=5] - The number of rows to return.
   * @returns {DataFrame} - A new DataFrame containing the first n rows of the original DataFrame.
   */
  head(n = 5): DataFrame {
    return new DataFrame(this.data.slice(0, n));
  }

  /**
   * Gets the last n rows of the DataFrame.
   *
   * @param {number} [n=5] - The number of rows to return.
   * @returns {DataFrame} - A new DataFrame containing the last n rows of the original DataFrame.
   */
  tail(n = 5): DataFrame {
    return new DataFrame(this.data.slice(-n));
  }
}

export type DataType = 'number' | 'string' | 'boolean' | 'object' | 'undefined';
