export type IRawDatatype = number | string | boolean | Date;

export type IParameters = Record<string, IRawDatatype>;
export type IRawResult = {
  recordset: Record<string, any>[];
  output: Record<string, any>;
};

export type IParsedResult = Record<string, any>;
