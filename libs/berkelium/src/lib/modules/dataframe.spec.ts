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
});
