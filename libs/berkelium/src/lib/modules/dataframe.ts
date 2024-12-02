export class DataFrame {
  private data: Array<object>;
  private headers: Array<string>;

  /**
   * Creates a DataFrame object.
   * @param {Array<Object>} data - Array of objects where keys are column names.
   */
  constructor(data: Array<object>) {
    if (
      !Array.isArray(data) ||
      !data.every((item) => typeof item === 'object')
    ) {
      throw new Error('Data must be an array of objects');
    }
    this.data = data;
    this.headers = Object.keys(data[0] || {});
  }

  /**
   * Displays the first n rows of the DataFrame.
   * @param {number} n - Number of rows to display (default: 5).
   * @returns {Array<Object>} - The first n rows.
   */
  head(n = 5): Array<object> {
    return this.data.slice(0, n);
  }

  /**
   * Displays the last n rows of the DataFrame.
   * @param {number} n - Number of rows to display (default: 5).
   * @returns {Array<Object>} - The last n rows.
   */
  tail(n = 5): Array<object> {
    return this.data.slice(-n);
  }

  /**
   * Returns an array with the number of rows and columns in the DataFrame.
   * @returns {[number, number]} - [number of rows, number of columns]
   */
  shape(): [number, number] {
    return [this.data.length, this.headers.length];
  }

  /**
   * Returns the column headers of the DataFrame.
   * @returns {Array<string>} - An array of strings representing the column names.
   */
  columns(): Array<string> {
    return this.headers;
  }

  /**
   * Prints the entire DataFrame to the console in a tabular format.
   */
  print(): void {
    console.table(this.data);
  }
}
