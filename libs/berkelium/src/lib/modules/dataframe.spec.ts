import * as fs from 'fs';
import { DataFrame } from './dataframe';
import { DataReader } from '../util/datareader';

const dataReader = new DataReader();
const csvData = fs.readFileSync('./data/sample_data.csv', 'utf-8');
const result = dataReader.readCSV(csvData);

describe('DataFrame', () => {
    it('Should create a DataFrame object', () => {
        const df = new DataFrame(result);
        // console.log(df);
        expect(df).toBeTruthy();
    });
});