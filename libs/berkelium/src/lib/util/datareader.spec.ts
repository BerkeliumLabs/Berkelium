import * as fs from 'fs';
import { DataReader } from './datareader';

describe('Read CSV file', () => {
  let dataReader: DataReader;
  let result: Array<object>;

  beforeEach(() => {
    dataReader = new DataReader();
    const csvData = fs.readFileSync('./data/sample_data.csv', 'utf-8');
    result = dataReader.readCSV(csvData);
  });
  it('should correctly parse a CSV string into an array of objects', () => {

    const expectedOutput = [
      {
        Name: 'Amara Perera',
        City: 'Colombo',
        Age: 29,
        'Monthly Income': 45000,
        'Date of Birth': '1995-06-12'
      },
      {
        Name: 'Nimal Jayasinghe',
        City: 'Kandy',
        Age: 34,
        'Monthly Income': undefined,
        'Date of Birth': '1990-03-22'
      },
      {
        Name: 'Pathum Silva',
        City: 'Negombo',
        Age: 45,
        'Monthly Income': 85000,
        'Date of Birth': '1979-09-30'
      },
      {
        Name: 'Sanduni Fernando',
        City: 'Galle',
        Age: undefined,
        'Monthly Income': 70000,
        'Date of Birth': '1994-02-15'
      },
      {
        Name: 'Chaminda Weerasinghe',
        City: 'Kurunegala',
        Age: 50,
        'Monthly Income': 55000,
        'Date of Birth': '1974-05-20'
      },
    ];

    expect(result.slice(0, 5)).toEqual(expectedOutput);
  });
});
