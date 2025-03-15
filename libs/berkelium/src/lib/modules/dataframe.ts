/* eslint-disable @typescript-eslint/no-explicit-any */
export class DataFrame {
  private _data: { [column: string]: any[] };
  private _columns: string[];
  private _index: number[];

  constructor(data: { [column: string]: any[] }, columns?: string[]) {
    this._data = data;
    this._columns = columns || Object.keys(data);
    this._index = Array.from({ length: this.rows() }, (_, i) => i);
  }

  static fromArrayOfObjects(data: any[]): DataFrame {
    if (data.length === 0) {
      return new DataFrame({});
    }
    const columns = Object.keys(data[0]);
    const columnData: { [column: string]: any[] } = {};
    for (const col of columns) {
      columnData[col] = data.map((row) => row[col]);
    }
    return new DataFrame(columnData);
  }

  static from2DArray(data: any[][], columns: string[]): DataFrame {
    if (data.length === 0) {
      return new DataFrame({});
    }
    const columnData: { [column: string]: any[] } = {};
    for (let i = 0; i < columns.length; i++) {
      const colName = columns[i];
      columnData[colName] = data.map((row) => row[i]);
    }
    return new DataFrame(columnData, columns);
  }

  clone(): DataFrame {
    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = [...this._data[col]]; // Deep copy of column arrays
    }
    const newDf = new DataFrame(newData, [...this._columns]);
    newDf._index = [...this._index];
    return newDf;
  }

  rows(): number {
    if (this._columns.length === 0) {
      return 0;
    }
    return this._data[this._columns[0]].length;
  }

  columns(): string[] {
    return [...this._columns];
  }

  shape(): [number, number] {
    return [this.rows(), this._columns.length];
  }

  head(n = 5): DataFrame {
    if (n < 0) {
      throw new Error('n must be a non-negative number.');
    }
    const numRows = Math.min(n, this.rows());
    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = this._data[col].slice(0, numRows);
    }
    const newDf = new DataFrame(newData, this._columns);
    newDf._index = this._index.slice(0, numRows);
    return newDf;
  }

  tail(n = 5): DataFrame {
    if (n < 0) {
      throw new Error('n must be a non-negative number.');
    }
    const numRows = Math.min(n, this.rows());
    const start = Math.max(0, this.rows() - numRows);
    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = this._data[col].slice(start);
    }
    const newDf = new DataFrame(newData, this._columns);
    newDf._index = this._index.slice(start);
    return newDf;
  }

  get(column: string): any[] {
    if (!this._columns.includes(column)) {
      throw new Error(`Column ${column} not found.`);
    }
    return [...this._data[column]];
  }

  set(column: string, values: any[]): void {
    if (!this._columns.includes(column)) {
      throw new Error(`Column ${column} not found.`);
    }
    if (values.length !== this.rows()) {
      throw new Error('Values length must match DataFrame rows.');
    }
    this._data[column] = values;
  }

  select(columns: string[]): DataFrame {
    const newData: { [column: string]: any[] } = {};
    for (const col of columns) {
      if (!this._columns.includes(col)) {
        throw new Error(`Column ${col} not found.`);
      }
      newData[col] = [...this._data[col]];
    }
    return new DataFrame(newData, columns);
  }

  filter(callback: (row: any, index: number) => boolean): DataFrame {
    const filteredIndices: number[] = [];
    const filteredRows: any[] = [];
    for (let i = 0; i < this.rows(); i++) {
      const row = this._getRow(i);
      if (callback(row, this._index[i])) {
        filteredIndices.push(this._index[i]);
        filteredRows.push(row);
      }
    }
    const newData = this._convertRowsToColumns(filteredRows);
    const newDf = new DataFrame(newData, this._columns);
    newDf._index = filteredIndices;
    return newDf;
  }

  addColumn(columnName: string, values: any[]): void {
    if (values.length !== this.rows()) {
      throw new Error('Values length must match DataFrame rows.');
    }
    this._data[columnName] = values;
    this._columns.push(columnName);
  }

  dropColumn(columnName: string): void {
    if (!this._columns.includes(columnName)) {
      throw new Error(`Column ${columnName} not found.`);
    }
    delete this._data[columnName];
    this._columns = this._columns.filter((col) => col !== columnName);
  }

  dropRow(index: number | number[]): void {
    const indicesToDrop = Array.isArray(index) ? index : [index];
    const newIndex = this._index.filter((i) => !indicesToDrop.includes(i));
    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = newIndex.map(
        (i) => this._data[col][this._index.indexOf(i)]
      );
    }
    this._data = newData;
    this._index = newIndex;
  }

  renameColumn(oldName: string, newName: string): void {
    if (!this._columns.includes(oldName)) {
      throw new Error(`Column ${oldName} not found.`);
    }
    if (this._columns.includes(newName)) {
      throw new Error(`Column ${newName} already exists.`);
    }
    const index = this._columns.indexOf(oldName);
    this._columns[index] = newName;
    this._data[newName] = this._data[oldName];
    delete this._data[oldName];
  }

  sortValues(by: string, ascending = true): DataFrame {
    if (!this._columns.includes(by)) {
      throw new Error(`Column ${by} not found.`);
    }
    const sortedIndices = [...this._index].sort((a, b) => {
      const valA = this._data[by][this._index.indexOf(a)];
      const valB = this._data[by][this._index.indexOf(b)];
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = sortedIndices.map(
        (i) => this._data[col][this._index.indexOf(i)]
      );
    }

    const newDf = new DataFrame(newData, this._columns);
    newDf._index = sortedIndices;
    return newDf;
  }

  apply(column: string, callback: (value: any, index: number) => any): void {
    if (!this._columns.includes(column)) {
      throw new Error(`Column ${column} not found.`);
    }
    this._data[column] = this._data[column].map((value, index) =>
      callback(value, this._index[index])
    );
  }

  map(callback: (row: any, index: number) => any): any[] {
    const results: any[] = [];
    for (let i = 0; i < this.rows(); i++) {
      const row: any = {};
      for (const col of this._columns) {
        row[col] = this._data[col][i];
      }
      results.push(callback(row, this._index[i]));
    }
    return results;
  }

  concat(other: DataFrame, axis: 0 | 1 = 0): DataFrame {
    if (axis === 0) {
      // Rows
      if (
        !this._columns.every((col) => other._columns.includes(col)) ||
        !other._columns.every((col) => this._columns.includes(col))
      ) {
        throw new Error(
          'DataFrames must have the same columns for row concatenation.'
        );
      }
      const newData: { [column: string]: any[] } = {};
      for (const col of this._columns) {
        newData[col] = [...this._data[col], ...other._data[col]];
      }
      const newDf = new DataFrame(newData, this._columns);
      newDf._index = [...this._index, ...other._index];
      return newDf;
    } else {
      // Columns
      const newColumns = [
        ...this._columns,
        ...other._columns.filter((c) => !this._columns.includes(c)),
      ];
      const newData: { [column: string]: any[] } = {};
      for (const col of newColumns) {
        if (this._columns.includes(col)) {
          newData[col] = [...this._data[col]];
        } else {
          newData[col] = [...other._data[col]];
        }
      }
      const newDf = new DataFrame(newData, newColumns);
      newDf._index = [...this._index];
      return newDf;
    }
  }

  fillNa(value: any): DataFrame {
    const newData: { [column: string]: any[] } = {};
    for (const col of this._columns) {
      newData[col] = this._data[col].map((val) =>
        val === undefined || val === null ? value : val
      );
    }
    return new DataFrame(newData, this._columns);
  }

  unique(column: string): any[] {
    if (!this._columns.includes(column)) {
      throw new Error(`Column ${column} not found.`);
    }
    return [...new Set(this._data[column])];
  }

  private _getRow(rowIndex: number): any {
    const row: any = {};
    for (const col of this._columns) {
      row[col] = this._data[col][rowIndex];
    }
    return row;
  }

  private _convertRowsToColumns(rows: any[]): { [column: string]: any[] } {
    const columns: { [column: string]: any[] } = {};
    if (rows.length === 0) {
      return columns;
    }
    const keys = Object.keys(rows[0]);
    for (const col of keys) {
      columns[col] = rows.map((row) => row[col]);
    }
    return columns;
  }
}

export type DataType = 'number' | 'string' | 'boolean' | 'object' | 'undefined';
