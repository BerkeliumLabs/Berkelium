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

  test('Should display if the column has same data type', () => {
    expect(df.isSameType('Monthly Income')).toBe(false);
    expect(df.isSameType('Date of Birth')).toBe(true);
  });

  test('Should return rows with wrong data type', () => {
    const wrongTypeRows = df.getWrongTypeRows('Monthly Income');
    console.table(wrongTypeRows);
    expect(wrongTypeRows.length).toBe(5);
  });

  test('Should remove rows with wrong data type', () => {
    const wrongTypeRows = df.getWrongTypeRows('Monthly Income');
    df.deleteObservations(wrongTypeRows.map((row) => row['index']));
    expect(df.shape).toEqual([25, 5]);
  });

  test('Should update an element in the DataFrame', () => {
    const wrongTypeRows = df.getWrongTypeRows('Monthly Income');
    df.updateElement(wrongTypeRows[0]['index'], 'Monthly Income', 45000);
    expect(df.head(1).array('Monthly Income')).toEqual([45000]);
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

  test('Should calculate the mode of a numeric column', () => {
    const df2 = df.fillna(df.median('Monthly Income'), 'Monthly Income');
    expect(df2.mode('Monthly Income')).toEqual(62000);
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

  test('Should display whether a column has null or undefined values', () => {
    expect(df.isNull('Name')).toBe(true);
    expect(df.isNull('Date of Birth')).toBe(false);
  });

  test('Should update a column name in the DataFrame', () => {
    df.renameColumn('Date of Birth', 'dob');
    df.renameColumn('Monthly Income', 'mon_inc');
    expect(df.columns).toEqual(['Name', 'City', 'Age', 'mon_inc', 'dob']);
  });

  test('Should display if the DataFrame has undefined values', () => {
    expect(df.hasUndefined()).toBe(true);
  });

  test('Should display whether the DataFrame has duplicate rows', () => {
    expect(df.hasDuplicates()).toBe(false);
  });

  test('Should display if the DataFrame has values with wrong data type', () => {
    df.updateElement(0, 'Monthly Income', '45000');
    const df2 = df.dropna();
    expect(df2.hasWrongDataTypes()).toBe(true);
  });

  test('Should deduplicate the DataFrame', () => {
    const df2 = df.dedup();
    expect(df2.shape).toEqual([30, 5]);
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

  test('should calculate value counts for a column', () => {
    const counts = df.valueCounts('City');
    expect(counts).toEqual(expect.objectContaining({
      "Colombo": 4,
      "Kandy": 2,
      "Negombo": 2,
      "Galle": 3,
      "Kurunegala": 3,
      "Anuradhapura": 2,
      "Badulla": 2,
      "Gampaha": 2,
      "Hambantota": 2,
      "Jaffna": 2,
      "Matara": 2,
      "Batticaloa": 1,
      "Matale": 1
    }));
  });

  test('should select columns by dtypes', () => {
    const selectedDf = df.selectDtypes(['number']);
    expect(selectedDf.columns).toEqual(["Age", "Monthly Income"]);
  });

  test('should filter rows based on predicate', () => {
    const filteredDf = df.filter((row) => row["Monthly Income"] > 60000);
    expect(filteredDf.shape).toEqual([13, 5]);
  });

  test('should group data by a column', () => {
    const groups = df.groupBy('City');
    expect(groups).toHaveProperty('Colombo');
    expect(groups['Colombo']).toBeInstanceOf(DataFrame);
    expect(groups['Colombo'].shape).toEqual([4, 5]);
  });

  test('Should display selected columns data from the DataFrame', () => {
    const selectedDf = df.select(['Name', 'Age']);
    expect(selectedDf).toBeInstanceOf(DataFrame);
    expect(selectedDf.columns).toEqual(['Name', 'Age']);
  });

  test('Should insert a new column into the DataFrame', () => {
    const newDf = df.insert('Country', Array.from({ length: 30 }, () => 'Sri Lanka'));
    // console.table(newDf.head().print());
    expect(newDf.columns).toEqual(['Name', 'City', 'Age', 'Monthly Income', 'Date of Birth', 'Country']);
  });

  test('Should update a column in the DataFrame', () => {
    const updatedDf = df.update('Age', Array.from({ length: 30 }, () => 25));
    expect(updatedDf.select(['Age']).print()).toEqual(
      Array.from({ length: 30 }, () => { return { "Age": 25 } })
    );
  });

  test('Should delete a column from the DataFrame', () => {
    const deletedDf = df.delete('City');
    expect(deletedDf).toBeInstanceOf(DataFrame);
    expect(deletedDf.columns).toEqual(['Name', 'Age', 'Monthly Income', 'Date of Birth']);
  });

  test('should calculate variance for numerical columns', () => {
    const df2 = df.selectDtypes(['number']).fillna(0);
    const variance = df2.var();
    // console.table(variance);
    expect(variance[0]['variance']).toBeCloseTo(202.57931);
    expect(variance[1]['variance']).toBeCloseTo(773127586.21);
  });

  /* test('Should calculate covariance for numerical columns', () => {
    const df2 = df.selectDtypes(['number']).fillna(0);
    const covariance = df2.cov();
    console.table(covariance);
    console.log(df2.array('Age'));
  }); */

  test('Should display the values of the specified column from each row in the DataFrame.', () => {
    expect(df.head().array('Age')).toEqual([29, 34, 45, undefined, 50]);
  });

  test('Should transform column values in the DataFrame', () => {
    const transformedDf = df.transform('Age', (value) => value * 2);
    expect(transformedDf.head().array('Age')).toEqual([58, 68, 90, undefined, 100]);
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
