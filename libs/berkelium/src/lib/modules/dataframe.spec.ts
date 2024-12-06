import * as fs from 'fs';
import { DataFrame } from './dataframe';
import { DataReader } from '../util/datareader';

describe('DataFrame', () => {
  let result: Array<object>;
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
  it('Should display the first 5 rows of the DataFrame', () => {
    console.table(df.head());
    expect(df.head()).toEqual(result.slice(0, 5));
  });
  it('Should display the last 5 rows of the DataFrame', () => {
    console.table(df.tail());
    expect(df.tail()).toEqual(result.slice(-5));
  });
  it('Should display the shape of the DataFrame', () => {
    expect(df.shape).toEqual([30, 5]);
  });
  it('Should display the column headers of the DataFrame', () => {
    expect(df.columns).toEqual([
      'Name',
      'City',
      'Age',
      'Monthly Income',
      'Date of Birth',
    ]);
  });
  it('Should display the info of the DataFrame', () => {
    const dfInfo = df.info();
    console.log(
      `DataFrame Info:
      Number of rows: ${dfInfo['rows']}
      Number of columns: ${dfInfo['columns']}\n`
    );
    console.table(dfInfo.info);
  });
  it('Should display selected columns data from the DataFrame', () => {
    // df.select(['Name', 'Age']).print();
    expect(df.select(['Name', 'Age'])).toBeTruthy();
  });
  it('Should display the count of non-null values in a column', () => {
    expect(df.count('Monthly Income')).toEqual(25);
  });
  it('Should calculate the mean of a numeric column', () => {
    expect(df.mean('Monthly Income')).toEqual(63480);
  });
  it('Should calculate the standard deviation of a numeric column', () => {
    expect(df.std('Monthly Income')).toEqual(15006.98504);
  });
  it('Should calculate the minimum value of a numeric column', () => {
    expect(df.min('Monthly Income')).toEqual(40000);
  });
  it('Should calculate the maximum value of a numeric column', () => {
    expect(df.max('Monthly Income')).toEqual(91000);
  });
  it('Should calculate quartiles of a numeric column', () => {
    expect(df.quartiles('Monthly Income')).toEqual({
      '25%': 50000,
      '50%': 62000,
      '75%': 74000,
    });
  });
  it('Should calculate the median of a numeric column', () => {
    expect(df.median('Monthly Income')).toEqual(62000);
  });
  /* it('Should calculate the mode of a numeric column', () => {
        expect(df.mode('Monthly Income')).toEqual(45000);
    }); */
  /* it('Should calculate the sum of a numeric column', () => {
        expect(df.sum('Monthly Income')).toEqual(1750000);
    }); */
  /* it('Should calculate the variance of a numeric column', () => {
        expect(df.variance('Monthly Income')).toEqual(1750000);
    }); */
  it('Should fill null values with a specified value', () => {
    df.fillna(0);
  });
  it('Should drop rows with null values', () => {
    df.dropna();
    // df.print();
  });
  it('Should display descriptive statistics for all numeric columns', () => {
    df.fillna(0);
    // console.log(df.describe());
    expect(df.describe()).toBeTruthy();
  });
  it('Should get a specific column from the DataFrame', () => {
    expect(df.getColumn('Monthly Income')).toEqual(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.map((row: any) => row['Monthly Income'])
    );
  });
  it('Should set values for a specific column in the DataFrame', () => {
    df.setColumn('Monthly Income 2', new Array(30).fill(120));
    expect(df.getColumn('Monthly Income 2')).toEqual(new Array(30).fill(120));
  });
  it('Should copy the DataFrame', () => {
    expect(df.copy()).toBeTruthy();
  });
  it('Should display count of null values in each column', () => {
    console.table(df.isNull().head());
  });
});
