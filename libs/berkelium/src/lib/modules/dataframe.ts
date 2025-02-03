export class DataFrame {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: Map<string, any>[];
  private colDataTypes: Map<string, DataType> = new Map();

  /**
   * Initializes a new instance of the DataFrame class with the provided data.
   *
   * @param {Map<string, any[]>[]} data - An array of records where each record
   * contains a string key and an array of any type values, representing the data
   * to be stored in the DataFrame.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: Map<string, any[]>[]) {
    this.data = data;
    this.getDataTypes();
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
   * @returns {Map<string, DataType>} - An object mapping each column name to its data type.
   * If the DataFrame is empty, returns an empty object.
   */
  get dTypes(): Map<string, DataType> {
    if (this.data.length === 0) return new Map();

    return this.colDataTypes;
  }

  /**
   * Gets the data types of each column in the DataFrame.
   *
   * @returns {Map<string, DataType>} - An object mapping each column name to its data type.
   * If the DataFrame is empty, returns an empty object.
   * This function is expensive and should only be called when the DataFrame is first created
   * or when the data types of the columns have changed.
   */
  getDataTypes(): Map<string, DataType> {
    this.colDataTypes = this.columns.reduce((acc, col) => {
      acc.set(col, this.mostFrequentType(this.array(col))[0]);
      return acc;
    }, new Map() as Map<string, DataType>);

    return this.colDataTypes;
  }

  /**
   * Checks if all values in the specified column have the same data type.
   *
   * @param {string} column - The name of the column to check.
   * @returns {boolean} - `true` if all values in the column have the same data type as the column's data type; `false` otherwise.
   */
  isSameType(column: string): boolean {
    return this.data.every((row) => typeof row.get(column) === this.dTypes.get(column));
  }

  /**
   * Returns an array of objects representing the rows that have a different data type than the data type of the specified column.
   * Each object contains the original row data with an additional "index" property set to the index of the row in the original DataFrame.
   * If no rows have a different data type, an empty array is returned.
   * @param {string} column - The name of the column to check.
   * @returns {Map<string, any>[]} - An array of objects representing the rows with a different data type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWrongTypeRows(column: string): Map<string, any>[] {
    return this.data
      .map((row, index) => {
        if (typeof row.get(column) !== this.dTypes.get(column)) {
          row.set("index", index);
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
    this.data[index].set(column, value);
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
   * @returns { { shape: [number, number], columns: string[], dTypes: Map<string, DataType> } }
   * An object with the following properties:
   *  - `shape`: A tuple of two numbers representing the number of rows and columns in the DataFrame.
   *  - `columns`: An array of strings representing the column labels of the DataFrame.
   *  - `dTypes`: An object mapping each column name to its data type.
   */
  info(): {
    shape: [number, number];
    columns: string[];
    dTypes: Map<string, DataType>;
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
      .map((row) => row.get(column))
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
    if (this.dTypes.get(column) !== 'number') {
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
      .map((row) => row.get(column))
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
   * Returns a summary of the DataFrame's columns.
   *
   * If `categorical` is true, returns a dictionary where the keys are the column names and the values are an object with the following properties:
   *   - `count`: The number of rows in the DataFrame that have a value in the given column.
   *   - `unique`: The number of unique values in the given column.
   *   - `top`: The most frequent value in the given column.
   *   - `freq`: The frequency of the most frequent value in the given column.
   *
   * If `categorical` is false, returns a dictionary where the keys are the column names and the values are an object with the following properties:
   *   - `count`: The number of rows in the DataFrame that have a value in the given column.
   *   - `mean`: The mean of the given column.
   *   - `std`: The standard deviation of the given column.
   *   - `min`: The minimum value of the given column.
   *   - `25%`: The 25th percentile of the given column.
   *   - `50%`: The 50th percentile of the given column.
   *   - `75%`: The 75th percentile of the given column.
   *   - `max`: The maximum value of the given column.
   *
   * @param {boolean} [categorical=false] - Whether to calculate summary statistics for categorical or numerical columns.
   * @returns {Map<string, any>} - A dictionary with the summary statistics for each column in the DataFrame.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  describe(categorical = false): Map<string, any> {
    if (categorical) {
      const categoricalColumns = this.columns.filter(
        (col) => this.dTypes.get(col) !== 'number'
      );

      return categoricalColumns.reduce((acc, col) => {
        const freqMap = this.calculateFrequency(this.array(col));
        const topFreq = this.getKeyWithMaxValue(freqMap);
        const stats = {
          count: this.count(col),
          unique: this.unique(col).length,
          top: topFreq[0],
          freq: topFreq[1],
        };
        return acc.set(col, stats);
      }, new Map());
    } else {
      const numericalColumns = this.columns.filter(
        (col) => this.dTypes.get(col) === 'number'
      );

      return numericalColumns.reduce((acc, col) => {
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
          return acc.set(col, stats);
        }, new Map());
    }
  }

  /**
   * Returns true if the specified column contains a null or undefined value in any row of the DataFrame.
   *
   * @param {string} column - The name of the column to check.
   * @returns {boolean} - True if the column contains at least one null or undefined value, false otherwise.
   */
  isNull(column: string): boolean {
    return this.data.some((row) => !this.isNotEmpty(row.get(column)));
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
    return this.columns.some((col) => !this.isSameType(col));
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
      this.columns.every((col) => row.get(col) !== undefined)
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
      if (column) {
        row.set(column, row.get(column) ?? value);
      } else {
        row.forEach((key) => {
          row.set(key, row.get(key) ?? value);
        });
      }
      return row;
    });

    return new DataFrame(filteredData);
  }

  /**
   * Counts the occurrences of each unique value in the specified column.
   *
   * @param {string} column - The name of the column to count unique values for.
   * @returns {Map<any, number>} - An object mapping each unique value in the column
   * to the number of times it appears in the DataFrame.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueCounts(column: string): Map<any, number> {
    return this.data.reduce((acc, row) => {
      const value = row.get(column);
      acc.set(value, (acc.get(value) || 0) + 1); //acc[value] = (acc[value] || 0) + 1;
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Map<any, number>);
  }

  /**
   * Selects columns from the DataFrame that match the given data types.
   *
   * @param {DataType[]} types - The data types to select columns for.
   * @returns {DataFrame} - A new DataFrame with columns filtered by the given data types.
   */
  selectDtypes(types: DataType[]): DataFrame {
    const filteredColumns = this.columns.filter((col) =>
      types.includes(this.dTypes.get(col) as DataType)
    );
    const filteredData = this.data.map((row) =>
      new Map(filteredColumns.map((col) => [col, row.get(col)]))
    );

    return new DataFrame(filteredData);
  }

  /**
   * Filters the DataFrame to only include rows that satisfy the given predicate.
   *
   * @param { (row: Map<string, any>) => boolean } predicate - A function that takes
   * a row as an argument and returns a boolean indicating whether the row should be
   * included in the filtered DataFrame.
   * @returns {DataFrame} - A new DataFrame containing only the filtered rows.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter(predicate: (row: Map<string, any>) => boolean): DataFrame {
    const filteredData = this.data.filter(predicate);
    return new DataFrame(filteredData);
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
      row.delete(column);
      return row;
    });
    return new DataFrame(newData);
  }

  /**
   * Calculates the variance of each numerical column in the DataFrame.
   *
   * @returns {Map<string, any>[]} - An array of objects, each containing the name of a
   * numerical column and its variance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var(): Map<string, any>[] {
    const numericalColumns = this.columns.filter((col) =>
      this.data.some((row) => typeof row.get(col) === 'number')
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return numericalColumns.map((col) => new Map<string, any>([
      ['column', col],
      ['variance', this.calculateVariance(col)],
    ]));
  }

  /* cov(): Map<string, any>[] {
    const numericalColumns = this.columns.filter((col) => this.data.some((row) => typeof row[col] === 'number'));
    const results: Map<string, any>[] = [];

    for (const col1 of numericalColumns) {
      const row: Map<string, any> = { column: col1 };
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
    return this.data.map((row) => row.get(col));
  }

  /**
   * Applies a transformation to the specified column in the DataFrame.
   *
   * @param {string} column - The name of the column to transform.
   * @param {(value: any) => any} fn - The transformation function to apply to each value in the
   * specified column. The function should take a single argument, the value of the column in the
   * current row, and return the transformed value.
   * @returns {DataFrame} - A new DataFrame with the transformed column.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(column: string, fn: (value: any) => any): DataFrame {
    if (!this.columns.includes(column)) {
      throw new Error(`Column ${column} does not exist in the DataFrame.`);
    }

    const transformedData = this.data.map((row) => {
      if (!row.get(column)) return row;
      row.set(column, fn(row.get(column)));
      return row;
    });

    return new DataFrame(transformedData);
  }

  /**
   * Returns an array of unique values in the specified column of the DataFrame.
   *
   * @param {string} column - The name of the column to extract unique values from.
   * @returns {any[]} - An array of unique values in the specified column.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unique(column: string): any[] {
    return [
      ...new Set(this.array(column).filter((value) => value !== undefined)),
    ];
  }

  /**
   * Prints the DataFrame to the console.
   *
   * Returns the DataFrame data as an array of objects, which can be logged to the console.
   *
   * @returns {Map<string, any>[]} - The DataFrame data as an array of objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  print(): Map<string, any>[] {
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
  private mostFrequentType(arr: any[]): [DataType, Map<DataType, number>] {
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

    return [mostFrequentType as DataType, frequencyMap];
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
      acc.set(value, (acc.get(value) || 0) + 1);
      return acc;
    }, new Map() as Map<number, number>);

    const maxFrequency = Math.max(...Object.values(frequencyMap));
    const modes = Object.keys(frequencyMap)
      .filter((key) => frequencyMap.get(+key) === maxFrequency)
      .map(Number);

    if (modes.length === Object.keys(frequencyMap).length) {
      return [];
    }

    return modes;
  }

  /**
   * Calculates the frequency of each item in a given array.
   *
   * @param {Array<any>} arr - An array of values for which to calculate the frequency.
   * @returns {Map<any, number>} - A Map where the keys are the items in the array and the values
   * are the number of times each item appears in the array. If an item is undefined, it is
   * ignored. If the input array is empty, an empty Map is returned.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateFrequency(arr: Array<any>): Map<any, number> {
    if (!Array.isArray(arr)) {
      throw new Error('Input must be an array.');
    }

    const frequencyMap = new Map();

    for (const item of arr) {
      if (item) {
        frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
      }
    }

    return frequencyMap;
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

  /**
   * Finds the key-value pair with the maximum value in a given Map.
   *
   * @param {Map<any, number>} map - The Map to search.
   * @returns {([any, number] | undefined)} - The key-value pair with the maximum value,
   * or `undefined` if the Map is empty.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getKeyWithMaxValue(map: Map<any, number>): [any, number] {
    if (map.size === 0) {
      return [undefined, 0];
    }

    return [...map.entries()].reduce((maxEntry, currentEntry) => {
      return currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry;
    });
  }
}

export type DataType = 'number' | 'string' | 'boolean' | 'object' | 'undefined';
