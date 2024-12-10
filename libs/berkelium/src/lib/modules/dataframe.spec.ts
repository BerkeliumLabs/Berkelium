import * as fs from 'fs';
import { DataFrame } from './dataframe';
import { DataReader } from '../util/datareader';

describe('DataFrame', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: Record<string, any[]>[];
  let df: DataFrame;

  beforeEach(() => {
    const dataReader = new DataReader();
    const csvData = fs.readFileSync('./data/sample_data.csv', 'utf-8');
    result = dataReader.readCSV(csvData);
    df = new DataFrame(result);
  });

  it('Should create a DataFrame object', () => {
    expect(df).toBeTruthy();
  });

  test('should initialize and expose columns', () => {
    expect(df.columns).toEqual([
      'Name',
      'City',
      'Age',
      'Monthly Income',
      'Date of Birth',
    ]);
  });

  test('should expose index correctly', () => {
    const indices = Array.from({ length: result.length }, (_, i) => i);
    expect(df.index).toEqual(indices);
  });

  test('should calculate shape correctly', () => {
    expect(df.shape).toEqual([30, 5]);
  });

  test('should calculate dtypes correctly', () => {
    expect(df.dTypes).toEqual({
      "Name": "string",
      "City": "string",
      "Age": "number",
      "Monthly Income": "number",
      "Date of Birth": "string"
    });
  });

  test('should return head of the DataFrame', () => {
    const head = df.head(2);
    expect(head).toBeInstanceOf(DataFrame);
    expect(head.shape).toEqual([2, 5]);
  });

  test('should return tail of the DataFrame', () => {
    const tail = df.tail(2);
    expect(tail).toBeInstanceOf(DataFrame);
    expect(tail.shape).toEqual([2, 5]);
  });

  test('should create a deep copy', () => {
    const copy = df.copy();
    expect(copy).toBeInstanceOf(DataFrame);
    expect(copy).not.toBe(df);
    expect(copy).toEqual(df);
  });

  test('should return info of the DataFrame', () => {
    const info = df.info();
    expect(info).toEqual({
      shape: [30, 5],
      columns: [
        'Name',
        'City',
        'Age',
        'Monthly Income',
        'Date of Birth',
      ],
      dTypes: {
        "Name": "string",
        "City": "string",
        "Age": "number",
        "Monthly Income": "number",
        "Date of Birth": "string"
      }
    });
    console.table(info.dTypes)
  });

  test('Should return minimum value of a column', () => {
    const min = df.min('Monthly Income');
    expect(min).toBe(40000);
  });

  test('Should return maximum value of a column', () => {
    const min = df.max('Monthly Income');
    expect(min).toBe(91000);
  });

  test('Should calculate quartiles of a numeric column', () => {
    expect(df.quartiles('Monthly Income')).toEqual({
      '25%': 50000,
      '50%': 62000,
      '75%': 74000,
    });
  });
});
