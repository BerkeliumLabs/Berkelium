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
  get shape(): [number, number] {
    return [this.data.length, this.headers.length];
  }

  /**
   * Returns the column headers of the DataFrame.
   * @returns {Array<string>} - An array of strings representing the column names.
   */
  get columns(): Array<string> {
    return this.headers;
  }

  /**
   * Creates a shallow copy of the DataFrame.
   * This is useful when you need to modify the DataFrame without changing the original.
   * @returns {DataFrame} - A shallow copy of the DataFrame.
   */
  copy(): DataFrame {
    return new DataFrame([...this.data]);
  }

  /**
   * Gets all the data for a selected column.
   * @param {string} columnName - The name of the column to retrieve.
   * @returns {Array} - An array of values for the selected column.
   * @throws {Error} - If the column does not exist.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getColumn(columnName: string): Array<any> {
    if (!this.headers.includes(columnName)) {
      throw new Error(
        `Column "${columnName}" does not exist in the DataFrame.`
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.data.map((row: any) => row[columnName]);
  }

  /**
   * Sets the data for a selected column. If the column does not exist, it adds the column.
   * @param {string} columnName - The name of the column to set or update.
   * @param {Array} values - An array of values to set in the column.
   * @returns {void}
   * @throws {Error} - If the length of values does not match the number of rows.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setColumn(columnName: string, values: Array<any>): void {
    if (values.length !== this.data.length) {
      throw new Error(
        `Length of values (${values.length}) does not match number of rows (${this.data.length}).`
      );
    }

    // Add the column if it doesn't exist
    if (!this.headers.includes(columnName)) {
      this.headers.push(columnName);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.data = this.data.map((row: any, index: number) => {
      row[columnName] = values[index];
      return row;
    });
  }

  /**
   * Returns metadata information about the DataFrame.
   * Provides details such as the total number of rows and columns,
   * as well as a summary for each column that includes:
   * - Index number
   * - Column name
   * - Count of non-null values
   * - Data types present in the column
   *
   * @returns {object} An object containing DataFrame metadata,
   * including total row and column count, along with column-specific information.
   */
  info(): DataFrameInfo {
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

    const dfInfoAll = {
      rows: this.data.length,
      columns: this.headers.length,
      info: dfInfo,
    };

    return dfInfoAll;
  }

  /**
   * Selects specific columns from the DataFrame.
   * @param {Array<string>} columnNames - List of column names to select.
   * @returns {DataFrame} - A new DataFrame with the selected columns.
   */
  select(columnNames: Array<string>): DataFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredData = this.data.map((row: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columnNames.reduce((acc: any, col: any) => {
        if (col in row) acc[col] = row[col];
        return acc;
      }, {})
    );
    return new DataFrame(filteredData);
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
   * Returns an array of objects, each representing the count of null values in a column.
   * Each object contains the column name and the number of null values for that column.
   * @returns {Array<object>} - An array of objects with column names and their null value counts.
   */
  isNull(): DataFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nullCounts = this.data.map((row: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRow: any = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.keys(row).forEach((key: any) => {
        newRow[key] = this.isNotEmpty(row[key]);
      });

      return newRow;
    });
    
    return new DataFrame(nullCounts);
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
   * Calculates the standard deviation of a numeric column.
   * @param {string} column - The column name.
   * @returns {number} - The standard deviation value.
   */
  std(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    const mean = this.mean(column);
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Number(Math.sqrt(variance).toFixed(6));
  }

  /**
   * Calculates the minimum value of a numeric column.
   * @param {string} column - The column name.
   * @returns {number} - The minimum value.
   */
  min(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    return Math.min(...values);
  }

  /**
   * Calculates the maximum value of a numeric column.
   * @param {string} column - The column name.
   * @returns {number} - The maximum value.
   */
  max(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    return Math.max(...values);
  }

  /**
   * Calculates the quartiles (25%, 50%, 75%) of a numeric column.
   * @param {string} column - The column name.
   * @returns {Object} - An object with 25%, 50%, and 75% quartile values.
   */
  quartiles(column: string): { '25%': number; '50%': number; '75%': number } {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    values.sort((a, b) => a - b);

    return {
      '25%': this.getPercentile(0.25, values),
      '50%': this.getPercentile(0.5, values),
      '75%': this.getPercentile(0.75, values),
    };
  }

  /**
   * Calculates the median of a numeric column.
   * @param {string} column - The column name.
   * @returns {number} - The median value.
   */
  median(column: string): number {
    return this.quartiles(column)['50%'];
  }

  /**
   * Replaces `undefined` values in the DataFrame with a specified value.
   * @param {*} value - The value to replace `undefined` with.
   * @returns {void}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillna(value: any): void | DataFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.data = this.data.map((row: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filledRow: { [key: string]: any } = {};
      Object.keys(row).forEach((key) => {
        filledRow[key] = row[key] == undefined ? value : row[key];
      });
      return filledRow;
    });
  }

  /**
   * Removes rows with `undefined` values from the DataFrame.
   * @returns {void}
   */
  dropna(): void {
    this.data = this.data.filter((row) => {
      return Object.values(row).every((value) => value != undefined);
    });
  }

  /**
   * Returns summary statistics for all numeric columns in the DataFrame.
   * @returns {Object} - An object containing the summary statistics for numeric columns.
   */
  describe() {
    const summary: { [key: string]: DataSummary } = {};

    // Filter numeric columns
    const numericColumns = this.headers.filter((col: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.data.every((row: any) => typeof row[col] === 'number')
    );

    for (const col of numericColumns) {
      summary[col] = {
        count: this.count(col),
        mean: this.mean(col),
        std: this.std(col),
        min: this.min(col),
        '25%': this.quartiles(col)['25%'],
        '50%': this.quartiles(col)['50%'],
        '75%': this.quartiles(col)['75%'],
        max: this.max(col),
      };
    }

    return summary;
  }

  /**
   * Returns the entire dataset of the DataFrame.
   * @returns {Array<Object>} - An array of objects representing all rows in the DataFrame.
   */
  print(): Array<object> {
    return this.data;
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

  /**
   * Calculates the value at the given percentile of the sorted array.
   * This uses linear interpolation between the lower and upper values.
   * @param {number} p - The percentile (between 0 and 1) to calculate.
   * @param {number[]} values - The sorted array of values.
   * @returns {number} - The value at the given percentile.
   */
  private getPercentile(p: number, values: number[]): number {
    const index = p * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return values[lower] + (values[upper] - values[lower]) * (index - lower);
  }
}

export interface DataFrameInfo {
  rows: number;
  columns: number;
  info: {
    '#': number;
    Column: string;
    'Non-Null Count': number;
    Dtype: string;
  };
}

export interface DataSummary {
  count: number;
  mean: number;
  std: number;
  min: number;
  '25%': number;
  '50%': number;
  '75%': number;
  max: number;
}
