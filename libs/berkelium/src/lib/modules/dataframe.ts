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

  copy(): DataFrame {
    return new DataFrame(JSON.parse(JSON.stringify(this.data)));
  }

  /**
   * Returns an object containing information about the DataFrame.
   *
   * @returns { { shape: [number, number], columns: string[], dTypes: Record<string, DataType> } }
   * An object with the following properties:
   *  - `shape`: A tuple of two numbers representing the number of rows and columns in the DataFrame.
   *  - `columns`: An array of strings representing the column labels of the DataFrame.
   *  - `dTypes`: An object mapping each column name to its data type.
   */
  info(): {
    shape: [number, number];
    columns: string[];
    dTypes: Record<string, DataType>;
  } {
    const info = {
      shape: this.shape,
      columns: this.columns,
      dTypes: this.dTypes,
    };
    return info;
  }

  /**
   * Returns the minimum value in the specified column.
   *
   * @param {string} column - The name of the column to find the minimum value in.
   * @returns {number} - The minimum value in the specified column.
   */
  min(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    return Math.min(...values);
  }

  /**
   * Returns the maximum value in the specified column.
   *
   * @param {string} column - The name of the column to find the maximum value in.
   * @returns {number} - The maximum value in the specified column.
   */
  max(column: string): number {
    const values = this.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row[column])
      .filter((val) => typeof val === 'number');
    return Math.max(...values);
  }

  /**
   * Calculates the quartiles of the given column.
   *
   * @param {string} column - The name of the column to calculate the quartiles for.
   * @returns {{ '25%': number, '50%': number, '75%': number }} An object containing the 25th, 50th, and 75th percentiles of the column.
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
   * Returns the median value of the specified column.
   *
   * @param {string} column - The name of the column to find the median value in.
   * @returns {number} - The median value in the specified column.
   */
  median(column: string): number {
    return this.quartiles(column)['50%'];
  }

  /**
   * Calculates the mean value of the specified column.
   *
   * @param {string} column - The name of the column to calculate the mean value for.
   * @returns {number} - The mean value in the specified column.
   */
  mean(column: string): number {
    const values = this.data
      .map((row) => row[column])
      .filter((v) => typeof v === 'number');
    return values.reduce((acc, val) => acc + val, 0) / values.length;
  }

  /**
   * Calculates the standard deviation of the specified column.
   *
   * @param {string} column - The name of the column to calculate the standard deviation for.
   * @returns {number} - The standard deviation of the column.
   */
  std(column: string): number {
    const mean = this.mean(column);
    const values = this.data
      .map((row) => row[column])
      .filter((v) => typeof v === 'number');
    return Math.sqrt(
      values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length
    );
  }

  /**
   * Counts the number of rows in the DataFrame that have a value in the given column.
   *
   * @param {string} column - The name of the column to count.
   * @returns {number} - The number of rows in the DataFrame that have a value in the given column.
   */
  count(column: string): number {
    return this.data.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => this.isNotEmpty(row[column])
    ).length;
  }

  /**
   * Returns a summary of each numerical column in the DataFrame.
   *
   * For each numerical column, the returned object contains the following statistics:
   * - `count`: The number of rows with a value in the column.
   * - `mean`: The mean value of the column.
   * - `std`: The standard deviation of the column.
   * - `min`: The minimum value in the column.
   * - `25%`: The 25th percentile of the column.
   * - `50%`: The median (50th percentile) of the column.
   * - `75%`: The 75th percentile of the column.
   * - `max`: The maximum value in the column.
   *
   * @returns {Record<string, any>} - An object mapping each column to its summary statistics.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  describe(): Record<string, any> {
    const numericalColumns = this.columns.filter((col) =>
      this.data.some((row) => typeof row[col] === 'number')
    );

    return Object.fromEntries(
      numericalColumns.map((col) => {
        const stats = {
          count: this.count(col),
          mean: Number(this.mean(col).toFixed(6)),
          std: Number(this.std(col).toFixed(6)),
          min: Number(this.min(col).toFixed(6)),
          '25%': Number(this.quartiles(col)['25%'].toFixed(6)),
          '50%': Number(this.quartiles(col)['50%'].toFixed(6)),
          '75%': Number(this.quartiles(col)['75%'].toFixed(6)),
          max: Number(this.max(col).toFixed(6)),
        };
        return [col, stats];
      })
    );
  }

  /**
   * Removes rows from the DataFrame that contain undefined values in any column.
   *
   * @returns {DataFrame} - A new DataFrame with rows containing undefined values removed.
   */
  dropna(): DataFrame {
    const filteredData = this.data.filter((row) =>
      this.columns.every((col) => row[col] !== undefined)
    );

    return new DataFrame(filteredData);
  }

  /**
   * Replaces null or undefined values in the DataFrame with a given value.
   *
   * @param {any} value - The value to replace null or undefined values with.
   * @returns {DataFrame} - A new DataFrame with null or undefined values replaced.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillna(value: any): DataFrame {
    const filledData = this.data.map((row) => {
      const newRow = { ...row };
      this.columns.forEach((col) => {
        if (newRow[col] === null || newRow[col] === undefined) {
          newRow[col] = value;
        }
      });
      return newRow;
    });

    return new DataFrame(filledData);
  }

  /**
   * Counts the occurrences of each unique value in the specified column.
   *
   * @param {string} column - The name of the column to count unique values for.
   * @returns {Record<any, number>} - An object mapping each unique value in the column
   * to the number of times it appears in the DataFrame.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueCounts(column: string): Record<any, number> {
    return this.data.reduce((acc, row) => {
      const value = row[column];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<any, number>);
  }

  /**
   * Selects columns from the DataFrame that match the given data types.
   *
   * @param {DataType[]} types - The data types to select columns for.
   * @returns {DataFrame} - A new DataFrame with columns filtered by the given data types.
   */
  selectDtypes(types: DataType[]): DataFrame {
    const filteredColumns = this.columns.filter((col) =>
      types.includes(this.dTypes[col])
    );
    const filteredData = this.data.map((row) =>
      Object.fromEntries(filteredColumns.map((col) => [col, row[col]]))
    );

    return new DataFrame(filteredData);
  }

  /**
   * Filters the DataFrame to only include rows that satisfy the given predicate.
   *
   * @param { (row: Record<string, any>) => boolean } predicate - A function that takes
   * a row as an argument and returns a boolean indicating whether the row should be
   * included in the filtered DataFrame.
   * @returns {DataFrame} - A new DataFrame containing only the filtered rows.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter(predicate: (row: Record<string, any>) => boolean): DataFrame {
    const filteredData = this.data.filter(predicate);
    return new DataFrame(filteredData);
  }

  /**
   * Groups the DataFrame by the given column and returns a new object with the unique values
   * of the column as keys and the corresponding DataFrames as values.
   *
   * @param {string} col - The column to group by.
   * @returns {Record<string, DataFrame>} - A new object with the grouped DataFrames.
   */
  groupBy(col: string): Record<string, DataFrame> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: Record<string, Record<string, any>[]> = {};

    this.data.forEach((row) => {
      const key = row[col];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    return Object.fromEntries(
      Object.entries(groups).map(([key, group]) => [key, new DataFrame(group)])
    );
  }

  /**
   * Selects columns from the DataFrame and returns a new DataFrame with the selected columns.
   *
   * @param {Array<string>} columnNames - An array of column names to select from the DataFrame.
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
   * Inserts a new column into the DataFrame with the given data array.
   *
   * @param {string} column - The name of the column to be inserted.
   * @param {any[]} dataArray - An array of data to populate the new column. The length of this array
   * should match the number of rows in the DataFrame.
   * @returns {DataFrame} - A new DataFrame with the inserted column.
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert(column: string, dataArray: any[]): DataFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData = this.data.map((row: any) => {
      row[column] = dataArray.shift();
      return row;
    });
    return new DataFrame(newData);
  }

  /**
   * Prints the DataFrame to the console.
   *
   * Returns the DataFrame data as an array of objects, which can be logged to the console.
   *
   * @returns {Record<string, any>[]} - The DataFrame data as an array of objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  print(): Record<string, any>[] {
    return this.data;
  }

  /**
   * Calculates the percentile value from a sorted array of numbers.
   *
   * @param {number} p - The percentile to calculate (between 0 and 1).
   * @param {number[]} values - A sorted array of numbers from which to calculate the percentile.
   * @returns {number} - The calculated percentile value.
   */
  private getPercentile(p: number, values: number[]): number {
    const index = p * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return values[lower] + (values[upper] - values[lower]) * (index - lower);
  }

  /**
   * Checks if a value is not empty.
   *
   * @param {any} value - The value to check.
   * @returns {boolean} - `true` if the value is not empty, `false` otherwise.
   *
   * A value is considered empty if it is one of the following:
   * - null
   * - undefined
   * - false
   * - an empty string
   * - NaN
   * - an object with no keys
   * - an array with no elements
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

export type DataType = 'number' | 'string' | 'boolean' | 'object' | 'undefined';
