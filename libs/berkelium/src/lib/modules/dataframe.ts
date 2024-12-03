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
   * Displays a concise summary of the DataFrame.
   * The summary includes the number of rows and columns,
   * as well as the number of non-null values in each column and the data type of each column.
   * The summary is printed to the console in a tabular format.
   */
  info(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dfInfo: any = [];
    this.headers.forEach((col) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniqueTypes = new Set(this.data.map((row: any) => typeof row[col]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nonNull = this.data.filter((row: any) => this.isNotEmpty(row[col]));
      const infoRow = {
        '#': this.headers.indexOf(col),
        Column: col,
        'Non-Null Count': nonNull.length,
        Dtype: [...uniqueTypes].join(', '),
      };
      dfInfo.push(infoRow);
    });
    console.log(
      `DataFrame Info:
    Number of rows: ${this.data.length}
    Number of columns: ${this.headers.length}\n`
    );
    console.table(dfInfo);
  }

  /**
   * Calculates the count of non-null values in a column.
   * @param {string} column - The column name.
   * @returns {number} - Count of non-null values.
   */
  count(column: string): number {
    return this.data.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => this.isNotEmpty(row[column])
    ).length;
  }

  /**
   * Calculates the mean of a numeric column.
   * @param {string} column - The column name.
   * @returns {number} - The mean value.
   */
  mean(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Prints the entire DataFrame to the console in a tabular format.
   */
  print(): void {
    console.table(this.data);
  }

  /**
   * Checks if the given value is not empty.
   * A value is considered empty if it is null, undefined, false, an empty string, NaN, or an object with no keys.
   * @param {any} value - The value to be checked.
   * @returns {boolean} - True if the value is not empty, false if it is.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isNotEmpty(value: any): boolean {
    if (
      value === null ||
      value === undefined ||
      value === false ||
      value === '' ||
      Number.isNaN(value)
    ) {
      return false;
    }

    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return false;
      }
    }

    return true;
  }
}
