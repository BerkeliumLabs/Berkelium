import * as fs from 'fs';
import { DataReader } from './dataReader';

describe('Read CSV file', () => {
  let dataReader: DataReader;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: { [column: string]: any[] };

  beforeEach(() => {
    dataReader = new DataReader();
    const csvData = fs.readFileSync('./data/sample_data.csv', 'utf-8');
    const rows = csvData.trim().split('\n').slice(0, 6).join('\n'); // Limit to 5 data rows + header
    result = dataReader.readCSV(rows);
  });

  it('should correctly parse a CSV string into a column-oriented object (limited to 5 records)', () => {
    const expectedOutput = {
      Name: [
        'Amara Perera',
        'Nimal Jayasinghe',
        'Pathum Silva',
        'Sanduni Fernando',
        'Chaminda Weerasinghe',
      ],
      City: ['Colombo', 'Kandy', 'Negombo', 'Galle', 'Kurunegala'],
      Age: [29, 34, 45, undefined, 50],
      'Monthly Income': [45000, undefined, 85000, 70000, 55000],
      'Date of Birth': [
        '1995-06-12',
        '1990-03-22',
        '1979-09-30',
        '1994-02-15',
        '1974-05-20',
      ],
    };

    expect(result).toEqual(expectedOutput);
  });

  it('should correctly infer data types (limited to 5 records)', () => {
    expect(result.Age).toEqual([29, 34, 45, undefined, 50]);
    expect(result['Monthly Income']).toEqual([
      45000,
      undefined,
      85000,
      70000,
      55000,
    ]);
  });

  it('should handle undefined and null values (limited to 5 records)', () => {
    expect(result['Monthly Income'][1]).toBeUndefined();
    expect(result.Age[3]).toBeUndefined();
  });
});
