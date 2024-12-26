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
      acc[col] = this.mostFrequentType(this.array(col));
      return acc;
    }, {} as Record<string, DataType>);
  }

  /**
   * Checks if all values in the specified column have the same data type.
   *
   * @param {string} column - The name of the column to check.
   * @returns {boolean} - `true` if all values in the column have the same data type as the column's data type; `false` otherwise.
   */
  isSameType(column: string): boolean {
    return this.data.every((row) => typeof row[column] === this.dTypes[column]);
  }

  /**
   * Returns an array of objects representing the rows that have a different data type than the data type of the specified column.
   * Each object contains the original row data with an additional "index" property set to the index of the row in the original DataFrame.
   * If no rows have a different data type, an empty array is returned.
   * @param {string} column - The name of the column to check.
   * @returns {Record<string, any>[]} - An array of objects representing the rows with a different data type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWrongTypeRows(column: string): Record<string, any>[] {
    return this.data
      .map((row, index) => {
        if (typeof row[column] !== this.dTypes[column]) {
          row['index'] = index;
          return row;
        }
        return null;
      })
      .filter((row) => row !== null);
  }

  /**
   * Updates the value of a specific element in the DataFrame at the specified index and column.
   * @param {number} index - The index of the row to update.
   * @param {string} column - The name of the column to update.
   * @param {any} value - The new value to assign to the element.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateElement(index: number, column: string, value: any): void {
    this.data[index][column] = value;
  }

  /**
   * Deletes the specified rows from the DataFrame.
   *
   * @param {number[]} indices - An array of indices of the rows to delete.
   */
  deleteObservations(indices: number[]): void {
    this.data = this.data.filter((_, index) => !indices.includes(index));
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
   * Returns the mode of the specified column.
   *
   * If the column is non-numeric, throws an error.
   * If the column has no modes, returns undefined.
   * If the column has one mode, returns that mode.
   * If the column has multiple modes, returns the maximum of the modes.
   *
   * @param {string} column - The name of the column to find the mode of.
   * @returns {number | undefined} - The mode of the column, or undefined if no mode exists.
   */
  mode(column: string): number | undefined {
    if (this.dTypes[column] !== 'number') {
      throw new Error(`Column ${column} is not numeric`);
    }

    const modes = this.calculateMode(this.array(column));

    if (modes.length === 0) {
      return undefined;
    } else if (modes.length === 1) {
      return modes[0];
    } else {
      return Math.max(...modes);
    }
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
   * Returns true if the specified column contains a null or undefined value in any row of the DataFrame.
   *
   * @param {string} column - The name of the column to check.
   * @returns {boolean} - True if the column contains at least one null or undefined value, false otherwise.
   */
  isNull(column: string): boolean {
    return this.data.some((row) => !this.isNotEmpty(row[column]));
  }

  /**
   * Renames a column in the DataFrame.
   *
   * @param {string} oldName - The current name of the column to rename.
   * @param {string} newName - The new name for the column.
   * @returns {void}
   */
  renameColumn(oldName: string, newName: string): void {
    this.data = this.data.map((row) => {
      const newRow = Object.entries(row).map(([key, value]) => {
        if (key === oldName) {
          return [newName, value];
        }
        return [key, value];
      });
      return Object.fromEntries(newRow);
    });
  }

  /**
   * Checks if the DataFrame contains any undefined values in any column.
   *
   * @returns {boolean} - True if the DataFrame contains at least one undefined value, false otherwise.
   */
  hasUndefined(): boolean {
    return this.data.some((row) =>
      Object.values(row).some((value) => value === undefined)
    );
  }

  /**
   * Checks if the DataFrame contains any rows where the type of a value does not match the type of its column.
   *
   * @returns {boolean} - True if the DataFrame contains at least one row with a value of the wrong type, false otherwise.
   */
  hasWrongDataTypes(): boolean {
    return this.data.some((row) =>
      Object.keys(row).some(
        (column) => typeof row[column] !== this.dTypes[column]
      )
    );
  }

  /**
   * Checks if the DataFrame contains any duplicate rows.
   *
   * @returns {boolean} - True if the DataFrame contains duplicate rows, false otherwise.
   */
  hasDuplicates(): boolean {
    return (
      this.data.length !==
      new Set(this.data.map((row) => JSON.stringify(row))).size
    );
  }

  /**
   * Returns a new DataFrame containing only the unique rows from the original DataFrame.
   * The original DataFrame is not modified.
   *
   * @returns {DataFrame} - A new DataFrame with unique rows.
   */
  dedup(): DataFrame {
    return new DataFrame(
      this.data.filter((row, index) => this.data.indexOf(row) === index)
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
   * Fills null or undefined values in the DataFrame with the specified value.
   *
   * If a column name is specified, only that column will be filled. Otherwise,
   * all columns will be filled.
   *
   * @param {any} value - The value to fill null or undefined values with.
   * @param {string} [column] - The column to fill, if only one column should be filled.
   * @returns {DataFrame} - A new DataFrame with null or undefined values filled.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillna(value: any, column?: string): DataFrame {
    const filteredData = this.data.map((row) => {
      const newRow = { ...row };
      if (column) {
        newRow[column] = row[column] ?? value;
      } else {
        Object.keys(row).forEach((key) => {
          newRow[key] = row[key] ?? value;
        });
      }
      return newRow;
    });

    return new DataFrame(filteredData);
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
   * Updates a column in the DataFrame with the given data array.
   *
   * @param {string} column - The name of the column to be updated.
   * @param {any[]} dataArray - An array of data to populate the column. The length of this array
   * should match the number of rows in the DataFrame.
   * @returns {DataFrame} - A new DataFrame with the updated column.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(column: string, dataArray: any[]): DataFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newData = this.data.map((row: any) => {
      row[column] = dataArray.shift();
      return row;
    });
    return new DataFrame(newData);
  }

  /**
   * Deletes a column from the DataFrame.
   *
   * @param {string} column - The name of the column to be deleted.
   * @returns {DataFrame} - A new DataFrame with the deleted column.
   */
  delete(column: string) {
    const newData = this.data.map((row) => {
      delete row[column];
      return row;
    });
    return new DataFrame(newData);
  }

  /**
   * Calculates the variance of each numerical column in the DataFrame.
   *
   * @returns {Record<string, any>[]} - An array of objects, each containing the name of a
   * numerical column and its variance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var(): Record<string, any>[] {
    const numericalColumns = this.columns.filter((col) =>
      this.data.some((row) => typeof row[col] === 'number')
    );
    return numericalColumns.map((col) => ({
      column: col,
      variance: this.calculateVariance(col),
    }));
  }

  /* cov(): Record<string, any>[] {
    const numericalColumns = this.columns.filter((col) => this.data.some((row) => typeof row[col] === 'number'));
    const results: Record<string, any>[] = [];

    for (const col1 of numericalColumns) {
      const row: Record<string, any> = { column: col1 };
      for (const col2 of numericalColumns) {
        row[col2] = this.calculateCovariance(col1, col2);
      }
      results.push(row);
    }

    return results;
  }

  private calculateCovariance(col1: string, col2: string): number {
    const values1 = this.array(col1);
    const values2 = this.array(col2);
    const mean1 = this.mean(col1);
    const mean2 = this.mean(col2);

    console.log(values1, values2);

    return (
      values1.reduce((acc, val, i) => acc + (val - mean1) * (values2[i] - mean2), 0) /
      values1.length
    );
  } */

  /**
   * Calculates the variance of the specified column.
   *
   * @param {string} column - The name of the column to calculate the variance for.
   * @returns {number} - The variance of the column.
   * @private
   */
  private calculateVariance(column: string): number {
    const numericColumn = this.array(column);
    const mean = this.mean(column);

    const variance =
      numericColumn.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      (numericColumn.length - 1);

    return variance;
  }

  /**
   * Extracts the values of the specified column from each row in the DataFrame.
   *
   * @param {string} col - The name of the column to extract values from.
   * @returns {any[]} - An array containing the values of the specified column from each row.
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array(col: string): any[] {
    return this.data.map((row) => row[col]);
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
   * Determines the most frequent data type in the given array.
   *
   * @param {any[]} arr - An array of values to analyze.
   * @returns {DataType} - The data type that appears most frequently in the array.
   * If multiple data types have the same frequency, one of them is returned.
   * Excludes 'undefined' types from consideration.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mostFrequentType(arr: any[]): DataType {
    const frequencyMap = new Map();
    let maxCount = 0;
    let mostFrequentType = undefined;

    for (const item of arr) {
      const value = typeof item as DataType;

      if (value !== 'undefined') {
        const count = (frequencyMap.get(value) || 0) + 1;
        frequencyMap.set(value, count);

        if (count > maxCount) {
          maxCount = count;
          mostFrequentType = value;
        }
      }
    }

    return mostFrequentType as DataType;
  }

  /**
   * Calculates the mode(s) of a given array of numbers.
   *
   * @param {number[]} values - An array of numbers for which to calculate the mode(s).
   * @returns {number[]} - An array containing the mode(s) of the input array.
   * If all numbers appear with the same frequency, returns an empty array.
   */
  private calculateMode(values: number[]): number[] {
    const frequencyMap = values.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const maxFrequency = Math.max(...Object.values(frequencyMap));
    const modes = Object.keys(frequencyMap)
      .filter((key) => frequencyMap[+key] === maxFrequency)
      .map(Number);

    if (modes.length === Object.keys(frequencyMap).length) {
      return [];
    }

    return modes;
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
