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
      Name: 'string',
      City: 'string',
      Age: 'number',
      'Monthly Income': 'number',
      'Date of Birth': 'string',
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
      columns: ['Name', 'City', 'Age', 'Monthly Income', 'Date of Birth'],
      dTypes: {
        Name: 'string',
        City: 'string',
        Age: 'number',
        'Monthly Income': 'number',
        'Date of Birth': 'string',
      },
    });
    console.table(info.dTypes);
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

  test('Should calculate the median of a numeric column', () => {
    expect(df.median('Monthly Income')).toEqual(62000);
  });

  test('Should calculate the mean of a numeric column', () => {
    expect(df.mean('Monthly Income')).toEqual(63480);
  });

  test('Should calculate the standard deviation of a numeric column', () => {
    // expect(df.std('Monthly Income')).toEqual(15006.98504);
    expect(df.std('Monthly Income')).toBeCloseTo(15006.98504);
  });

  test('Should display the count of non-null values in a column', () => {
    expect(df.count('Monthly Income')).toEqual(25);
  });

  test('should describe numerical columns', () => {
    const description = df.describe();
    expect(description).toHaveProperty('Monthly Income');
    expect(description['Monthly Income']).toEqual(
      expect.objectContaining({
        count: 25,
        mean: 63480.000000,
        min: 40000.000000,
        max: 91000.000000,
        std: 15006.985040,
        '25%': 50000.000000,
        '50%': 62000.000000,
        '75%': 74000.000000,
      })
    );
  });

  test('should drop rows with null or undefined values', () => {
    const filteredDf = df.dropna();
    expect(filteredDf.shape).toEqual([17, 5]);
  });

  test('should fill null or undefined values', () => {
    const filledDf = df.fillna(0);
    expect(filledDf.shape).toEqual([30, 5]);
    expect(filledDf.head().print()).toEqual([
      { "Name": "Amara Perera", "City": "Colombo", "Age": 29, "Monthly Income": 45000, "Date of Birth": "1995-06-12" },
      { "Name": "Nimal Jayasinghe", "City": "Kandy", "Age": 34, "Monthly Income": 0, "Date of Birth": "1990-03-22" },
      { "Name": "Pathum Silva", "City": "Negombo", "Age": 45, "Monthly Income": 85000, "Date of Birth": "1979-09-30" },
      { "Name": "Sanduni Fernando", "City": "Galle", "Age": 0, "Monthly Income": 70000, "Date of Birth": "1994-02-15" },
      { "Name": "Chaminda Weerasinghe", "City": "Kurunegala", "Age": 50, "Monthly Income": 55000, "Date of Birth": "1974-05-20" }
    ]);
  });

  test('Should print the DataFrame to the console', () => {
    console.table(df.head().print());
    expect(df.head().print()).toEqual([
      { "Name": "Amara Perera", "City": "Colombo", "Age": 29, "Monthly Income": 45000, "Date of Birth": "1995-06-12" },
      { "Name": "Nimal Jayasinghe", "City": "Kandy", "Age": 34, "Monthly Income": undefined, "Date of Birth": "1990-03-22" },
      { "Name": "Pathum Silva", "City": "Negombo", "Age": 45, "Monthly Income": 85000, "Date of Birth": "1979-09-30" },
      { "Name": "Sanduni Fernando", "City": "Galle", "Age": undefined, "Monthly Income": 70000, "Date of Birth": "1994-02-15" },
      { "Name": "Chaminda Weerasinghe", "City": "Kurunegala", "Age": 50, "Monthly Income": 55000, "Date of Birth": "1974-05-20" }
    ])
  });
});
